import type Stripe from "stripe";
import {
  closePendingOrder,
  flagDisputedOrder,
  getOrderById,
  markOrderRefunded,
  settlePaidOrder,
} from "@/db/queries/orders";
import { isUuid } from "@/lib/checkout";
import { getStripe } from "@/lib/stripe";

// Applies Stripe-verified facts to our orders. Called from the webhook (the authority)
// and from the return page (a faster path to the same result). Everything here is
// idempotent, so being called twice, or concurrently, is safe.

export type SessionOutcome =
  | "paid"
  | "already_paid"
  | "refunded"
  | "needs_review"
  | "awaiting_payment"
  | "ignored";

function orderIdOf(session: Stripe.Checkout.Session): string | null {
  const id = session.client_reference_id ?? session.metadata?.order_id;
  return isUuid(id) ? id : null;
}

/** The order must exist AND belong to this exact Checkout Session. */
async function orderForSession(session: Stripe.Checkout.Session) {
  const orderId = orderIdOf(session);
  if (!orderId) return null;
  const order = await getOrderById(orderId);
  return order && order.stripeCheckoutSessionId === session.id ? order : null;
}

const idOf = (value: string | { id: string } | null | undefined) =>
  typeof value === "string" ? value : (value?.id ?? null);

/** Refund after a sell-out race. The idempotency key makes retries harmless. */
async function refundOutOfStockOrder(orderId: string, paymentIntentId: string | null) {
  if (!paymentIntentId) {
    console.error(`[checkout] order ${orderId} needs a refund but has no payment intent`);
    return "needs_review" as const;
  }
  await getStripe().refunds.create(
    { payment_intent: paymentIntentId, metadata: { order_id: orderId, cause: "out_of_stock" } },
    { idempotencyKey: `refund-order-${orderId}` },
  );
  await markOrderRefunded({ orderId });
  return "refunded" as const;
}

/** Confirms payment for a completed (or asynchronously succeeded) Checkout Session. */
export async function applyCheckoutSession(
  session: Stripe.Checkout.Session,
): Promise<SessionOutcome> {
  const order = await orderForSession(session);
  if (!order) return "ignored";
  // Delayed payment methods complete the session while still unpaid: not yet fulfilled.
  if (session.payment_status === "unpaid") return "awaiting_payment";

  const paymentIntentId = idOf(session.payment_intent);
  const result = await settlePaidOrder({
    orderId: order.id,
    amountTotal: session.amount_total,
    currency: session.currency,
    paymentIntentId,
    email: session.customer_details?.email ?? session.customer_email ?? null,
    shippingAddress: session.collected_information?.shipping_details ?? null,
  });

  switch (result) {
    case "paid":
      return "paid";
    case "already_paid":
      return "already_paid";
    case "refund_needed":
      return refundOutOfStockOrder(order.id, paymentIntentId ?? order.stripePaymentIntentId);
    case "needs_review":
      console.error(`[checkout] order ${order.id} needs review`);
      return "needs_review";
    case "unknown_order":
      return "ignored";
  }
}

/** Expired or asynchronously failed sessions: only a still-pending order is closed. */
async function closeSession(
  session: Stripe.Checkout.Session,
  status: "failed" | "expired",
  reason: string,
) {
  const order = await orderForSession(session);
  if (order) await closePendingOrder(order.id, status, reason);
}

export async function handleStripeEvent(event: Stripe.Event): Promise<void> {
  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded":
      await applyCheckoutSession(event.data.object);
      return;
    case "checkout.session.async_payment_failed":
      await closeSession(event.data.object, "failed", "async_payment_failed");
      return;
    case "checkout.session.expired":
      await closeSession(event.data.object, "expired", "session_expired");
      return;
    case "charge.refunded": {
      const charge = event.data.object;
      const paymentIntentId = idOf(charge.payment_intent);
      // Partial refunds leave the order paid; only a full refund changes its status.
      if (charge.refunded && paymentIntentId) await markOrderRefunded({ paymentIntentId });
      return;
    }
    case "charge.dispute.created": {
      // A chargeback takes the money back; a person decides what happens to the order.
      const paymentIntentId = idOf(event.data.object.payment_intent);
      if (paymentIntentId && (await flagDisputedOrder(paymentIntentId))) {
        console.error(`[checkout] dispute opened on payment ${paymentIntentId}`);
      }
      return;
    }
    default:
      return; // Recorded in the ledger but nothing to do.
  }
}
