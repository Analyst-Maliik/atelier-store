import Stripe from "stripe";

// Server-only Stripe setup. Keys come from the environment and are never logged.

let client: Stripe | undefined;

/**
 * One Stripe client per process. Use a restricted key (rk_...) from a Stripe sandbox.
 * Refuses live keys outside production so a dev machine can never take real payments.
 */
export function getStripe(): Stripe {
  if (client) return client;

  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not set. Add a sandbox restricted key to .env.local.");
  }
  if (process.env.NODE_ENV !== "production" && /^(sk|rk)_live_/.test(key)) {
    throw new Error("Refusing to use a live Stripe key outside production.");
  }
  if (!/^(sk|rk)_(test|live)_/.test(key)) {
    throw new Error("STRIPE_SECRET_KEY does not look like a Stripe secret or restricted key.");
  }

  client = new Stripe(key, { appInfo: { name: "atelier-store" } });
  return client;
}

export function getWebhookSecret(): string {
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!secret || !secret.startsWith("whsec_")) {
    throw new Error("STRIPE_WEBHOOK_SECRET is not set (expected a whsec_... signing secret).");
  }
  return secret;
}

/** Public origin used for Checkout return URLs; the same value Better Auth uses. */
export function getSiteUrl(): string {
  const url = process.env.BETTER_AUTH_URL?.trim().replace(/\/+$/, "");
  if (url) return url;
  if (process.env.NODE_ENV !== "production") return "http://localhost:3000";
  throw new Error("BETTER_AUTH_URL must be set to the public site URL in production.");
}

/** Tags our sessions in the Stripe Dashboard (label plus an 8-letter suffix). */
export const INTEGRATION_IDENTIFIER = "atelier-web-checkout-qzmvhtrk";
