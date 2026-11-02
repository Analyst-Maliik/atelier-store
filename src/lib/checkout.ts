// Checkout rules shared by the server. Amounts are integer cents, USD only.
// These are the ONLY source of shipping and totals: nothing here comes from the browser.

export const CURRENCY = "usd";

/** Orders at or above this subtotal ship free (matches the "over $250" banner). */
export const FREE_SHIPPING_THRESHOLD_CENTS = 25_000;
export const FLAT_SHIPPING_CENTS = 1_500;
export const ALLOWED_SHIPPING_COUNTRIES = ["US"] as const;

/** Stripe requires at least 30 minutes; a little extra avoids clock-skew rejections. */
export const CHECKOUT_TTL_SECONDS = 31 * 60;

export function shippingFor(subtotalCents: number): number {
  return subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS ? 0 : FLAT_SHIPPING_CENTS;
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isUuid = (value: unknown): value is string =>
  typeof value === "string" && UUID_PATTERN.test(value);

/** Checkout Session ids look like cs_test_a1B2... */
export const isCheckoutSessionId = (value: unknown): value is string =>
  typeof value === "string" && /^cs_(test|live)_[A-Za-z0-9]{10,200}$/.test(value);
