import type { OrderStatus } from "@/db/schema";

/** Short state names for lists, where the full sentences above would not fit. */
export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "Confirming payment",
  paid: "Confirmed",
  failed: "Payment failed",
  expired: "Expired",
  refunding: "Refunding",
  refunded: "Refunded",
  needs_review: "Under review",
};

/** Customer-facing wording for each order state, shared by the confirmation and account pages. */
export const ORDER_STATUS_COPY: Record<OrderStatus, { eyebrow: string; title: string; body: string }> = {
  pending: {
    eyebrow: "One moment",
    title: "Confirming your payment",
    body: "We are waiting for the payment provider to confirm. This usually takes a few seconds.",
  },
  paid: {
    eyebrow: "Thank you",
    title: "Your order is confirmed",
    body: "We have received your payment and will start preparing your order.",
  },
  failed: {
    eyebrow: "Payment problem",
    title: "Your payment did not go through",
    body: "You have not been charged. Your bag is still saved, so you can try again.",
  },
  expired: {
    eyebrow: "Checkout expired",
    title: "This checkout has expired",
    body: "You have not been charged. Your bag is still saved, so you can start again.",
  },
  refunding: {
    eyebrow: "Sorry",
    title: "An item sold out before we could confirm",
    body: "Another customer bought the last unit first. We are refunding your payment in full.",
  },
  refunded: {
    eyebrow: "Refunded",
    title: "Your payment has been refunded",
    body: "Your payment was refunded in full. It can take a few days to appear on your statement.",
  },
  needs_review: {
    eyebrow: "We are on it",
    title: "We are reviewing your order",
    body: "Something needs a quick manual check on our side. Please do not pay again; we will be in touch.",
  },
};
