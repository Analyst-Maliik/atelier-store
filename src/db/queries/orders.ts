import { randomUUID } from "node:crypto";
import { and, asc, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { orderItems, orders, stripeEvents, type OrderStatus } from "@/db/schema";
import { CURRENCY } from "@/lib/checkout";

// Not cached: order state must always be read fresh. Every state change is a single
// conditional statement (`WHERE status = ...`), so retries and concurrent webhook
// deliveries cannot apply the same transition twice. The Neon HTTP driver has no
// interactive transactions, so atomicity comes from one statement or db.batch().

export type NewOrderLine = {
  productId: number;
  name: string;
  unitPriceCents: number;
  quantity: number;
};

/** Inserts the order and its line snapshots atomically. Amounts are server-computed. */
export async function createPendingOrder(input: {
  userId: string | null;
  email: string | null;
  lines: NewOrderLine[];
  subtotalCents: number;
  shippingCents: number;
}): Promise<{ id: string; orderNumber: number }> {
  const id = randomUUID();
  const [created] = await db.batch([
    db
      .insert(orders)
      .values({
        id,
        userId: input.userId,
        email: input.email,
        subtotalCents: input.subtotalCents,
        shippingCents: input.shippingCents,
        totalCents: input.subtotalCents + input.shippingCents,
        currency: CURRENCY,
      })
      .returning({ id: orders.id, orderNumber: orders.orderNumber }),
    db.insert(orderItems).values(input.lines.map((line) => ({ ...line, orderId: id }))),
  ]);
  return created[0];
}

export async function attachCheckoutSession(orderId: string, sessionId: string) {
  await db
    .update(orders)
    .set({ stripeCheckoutSessionId: sessionId })
    .where(and(eq(orders.id, orderId), eq(orders.status, "pending")));
}

/** pending -> failed/expired. Returns true only for the call that made the change. */
export async function closePendingOrder(
  orderId: string,
  status: "failed" | "expired",
  reason: string,
): Promise<boolean> {
  const rows = await db
    .update(orders)
    .set({ status, statusReason: reason })
    .where(and(eq(orders.id, orderId), eq(orders.status, "pending")))
    .returning({ id: orders.id });
  return rows.length > 0;
}

export async function getOrderById(orderId: string) {
  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  return order ?? null;
}

export async function getOrderBySessionId(sessionId: string) {
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.stripeCheckoutSessionId, sessionId))
    .limit(1);
  return order ?? null;
}

export async function getOrderWithItems(orderId: string) {
  const order = await getOrderById(orderId);
  if (!order) return null;
  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, orderId))
    .orderBy(asc(orderItems.id));
  return { order, items };
}

export type SettleResult =
  | "paid" // this call confirmed the payment and decremented stock
  | "already_paid" // nothing to do: a previous call or event did it
  | "refund_needed" // paid, but stock ran out first: the caller must refund
  | "needs_review" // something did not add up; left for a person
  | "unknown_order";

function dbErrorCode(error: unknown): string | undefined {
  const e = error as { code?: string; cause?: { code?: string } };
  return e?.code ?? e?.cause?.code;
}

/**
 * Confirms a payment. Only Stripe-verified data may reach this function.
 * One SQL statement flips pending -> paid AND decrements stock for every line, so
 * either both happen or neither does. The products.stock_quantity >= 0 check makes
 * the statement fail as a whole if any item sold out in the meantime.
 */
export async function settlePaidOrder(args: {
  orderId: string;
  amountTotal: number | null;
  currency: string | null;
  paymentIntentId: string | null;
  email: string | null;
  shippingAddress: unknown;
}): Promise<SettleResult> {
  const order = await getOrderById(args.orderId);
  if (!order) return "unknown_order";

  switch (order.status) {
    case "paid":
    case "refunded":
      return "already_paid";
    case "refunding":
      return "refund_needed";
    case "needs_review":
      return "needs_review";
    case "expired":
    case "failed": {
      // Money arrived for an order we had closed: never ignore it silently.
      await db
        .update(orders)
        .set({
          status: "needs_review",
          statusReason: `paid_after_${order.status}`,
          stripePaymentIntentId: args.paymentIntentId,
        })
        .where(and(eq(orders.id, order.id), eq(orders.status, order.status)));
      return "needs_review";
    }
    case "pending":
      break;
  }

  // The amount we asked Stripe to charge must be the amount it says it collected.
  if (args.amountTotal !== order.totalCents || args.currency?.toLowerCase() !== order.currency) {
    await db
      .update(orders)
      .set({
        status: "needs_review",
        statusReason: "amount_mismatch",
        stripePaymentIntentId: args.paymentIntentId,
      })
      .where(and(eq(orders.id, order.id), eq(orders.status, "pending")));
    return "needs_review";
  }

  const address = args.shippingAddress ? JSON.stringify(args.shippingAddress) : null;
  try {
    const result = await db.execute(sql`
      WITH paid AS (
        UPDATE orders
           SET status = 'paid',
               paid_at = now(),
               updated_at = now(),
               stripe_payment_intent_id = ${args.paymentIntentId}::text,
               email = COALESCE(${args.email}::text, email),
               shipping_address = COALESCE(${address}::jsonb, shipping_address)
         WHERE id = ${order.id}::uuid AND status = 'pending'
        RETURNING id
      ),
      stock AS (
        UPDATE products p
           SET stock_quantity = p.stock_quantity - oi.quantity,
               updated_at = now()
          FROM order_items oi
         WHERE oi.order_id IN (SELECT id FROM paid) AND p.id = oi.product_id
        RETURNING p.id
      )
      SELECT (SELECT count(*) FROM paid)::int AS paid_rows
    `);
    const rows = (Array.isArray(result) ? result : (result as { rows: unknown[] }).rows) as {
      paid_rows: number;
    }[];
    return rows[0]?.paid_rows > 0 ? "paid" : "already_paid";
  } catch (error) {
    // 23514 = check_violation: a product's stock would have gone below zero.
    if (dbErrorCode(error) !== "23514") throw error;
    await db
      .update(orders)
      .set({
        status: "refunding",
        statusReason: "out_of_stock",
        stripePaymentIntentId: args.paymentIntentId,
        email: args.email ?? undefined,
      })
      .where(and(eq(orders.id, order.id), eq(orders.status, "pending")));
    return "refund_needed";
  }
}

export async function markOrderRefunded(
  where: { orderId: string } | { paymentIntentId: string },
): Promise<boolean> {
  const match =
    "orderId" in where
      ? eq(orders.id, where.orderId)
      : eq(orders.stripePaymentIntentId, where.paymentIntentId);
  const rows = await db
    .update(orders)
    .set({ status: "refunded" })
    .where(and(match, inArray(orders.status, ["paid", "refunding"] as OrderStatus[])))
    .returning({ id: orders.id });
  return rows.length > 0;
}

/**
 * paid -> needs_review when the customer disputes the charge. Only a still-paid order
 * moves: refunded or refunding orders already have their money handled.
 */
export async function flagDisputedOrder(paymentIntentId: string): Promise<boolean> {
  const rows = await db
    .update(orders)
    .set({ status: "needs_review", statusReason: "dispute_opened" })
    .where(and(eq(orders.stripePaymentIntentId, paymentIntentId), eq(orders.status, "paid")))
    .returning({ id: orders.id });
  return rows.length > 0;
}

// --- Webhook deduplication ledger ------------------------------------------------

/**
 * Records a Stripe event id. `alreadyProcessed` is true only if an earlier delivery
 * finished successfully; an earlier crashed attempt is retried (transitions are
 * idempotent, so that is safe).
 */
export async function recordStripeEvent(
  id: string,
  type: string,
): Promise<{ alreadyProcessed: boolean }> {
  const inserted = await db
    .insert(stripeEvents)
    .values({ id, type })
    .onConflictDoNothing({ target: stripeEvents.id })
    .returning({ id: stripeEvents.id });
  if (inserted.length > 0) return { alreadyProcessed: false };

  const [existing] = await db
    .select({ processedAt: stripeEvents.processedAt })
    .from(stripeEvents)
    .where(eq(stripeEvents.id, id))
    .limit(1);
  return { alreadyProcessed: Boolean(existing?.processedAt) };
}

export async function finishStripeEvent(id: string, error?: string) {
  await db
    .update(stripeEvents)
    .set(error ? { error: error.slice(0, 500) } : { processedAt: new Date(), error: null })
    .where(eq(stripeEvents.id, id));
}
