import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth";
import { products } from "./catalog";

export const ORDER_STATUSES = [
  "pending", // created, waiting for payment
  "paid", // payment confirmed and stock decremented
  "failed", // asynchronous payment failed
  "expired", // checkout session expired or was abandoned
  "refunding", // paid, but an item sold out first; refund in progress
  "refunded", // fully refunded
  "needs_review", // something did not add up; a person must look
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const orders = pgTable(
  "orders",
  {
    id: uuid().primaryKey().defaultRandom(),
    /** Human-friendly number shown to customers. */
    orderNumber: integer().notNull().generatedAlwaysAsIdentity({ startWith: 1001 }),
    /** Null for guest checkouts, or if the account is later deleted. */
    userId: text().references(() => user.id, { onDelete: "set null" }),
    email: text(),
    status: text().$type<OrderStatus>().notNull().default("pending"),
    /** All amounts are computed by the server from database prices, in cents. */
    subtotalCents: integer().notNull(),
    shippingCents: integer().notNull(),
    totalCents: integer().notNull(),
    currency: text().notNull().default("usd"),
    stripeCheckoutSessionId: text(),
    stripePaymentIntentId: text(),
    shippingAddress: jsonb(),
    /** Short machine-readable reason for failed / needs_review orders. */
    statusReason: text(),
    paidAt: timestamp({ withTimezone: true }),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    unique("orders_order_number_unique").on(t.orderNumber),
    unique("orders_stripe_session_unique").on(t.stripeCheckoutSessionId),
    index("orders_user_id_idx").on(t.userId),
    index("orders_status_idx").on(t.status),
    check(
      "orders_status_valid",
      sql`${t.status} in ('pending','paid','failed','expired','refunding','refunded','needs_review')`,
    ),
    check("orders_amounts_nonneg", sql`${t.subtotalCents} >= 0 and ${t.shippingCents} >= 0`),
    check("orders_total_matches", sql`${t.totalCents} = ${t.subtotalCents} + ${t.shippingCents}`),
  ],
);

export const orderItems = pgTable(
  "order_items",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    orderId: uuid()
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    productId: integer()
      .notNull()
      .references(() => products.id, { onDelete: "restrict" }),
    /** Snapshots: what the customer was shown and charged, even if the product changes later. */
    name: text().notNull(),
    unitPriceCents: integer().notNull(),
    quantity: integer().notNull(),
  },
  (t) => [
    unique("order_items_order_product_unique").on(t.orderId, t.productId),
    index("order_items_product_id_idx").on(t.productId),
    check("order_items_quantity_positive", sql`${t.quantity} > 0`),
    check("order_items_price_nonneg", sql`${t.unitPriceCents} >= 0`),
  ],
);

/** One row per Stripe webhook event id: the deduplication ledger. */
export const stripeEvents = pgTable("stripe_events", {
  id: text().primaryKey(),
  type: text().notNull(),
  receivedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  /** Set only after the event was handled successfully. */
  processedAt: timestamp({ withTimezone: true }),
  error: text(),
});
