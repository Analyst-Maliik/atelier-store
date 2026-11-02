import { finishStripeEvent, recordStripeEvent } from "@/db/queries/orders";
import { handleStripeEvent } from "@/lib/checkout-events";
import { getStripe, getWebhookSecret } from "@/lib/stripe";

/**
 * Stripe webhook endpoint: the authority on payment state.
 * 1. Verify the signature over the RAW body (anything else is rejected, nothing changes).
 * 2. Deduplicate by event id in the stripe_events ledger.
 * 3. Apply the event with idempotent, conditional database updates.
 * A non-2xx response makes Stripe retry, which is what we want for transient failures.
 */
export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  if (!signature) return new Response("Missing signature", { status: 400 });

  // Must be the unparsed body: re-serialising JSON would break the signature.
  const payload = await request.text();

  // Our own misconfiguration (missing key or secret) is a 500, so it is noticed and retried.
  let stripe;
  let secret;
  try {
    stripe = getStripe();
    secret = getWebhookSecret();
  } catch (error) {
    console.error("[stripe-webhook] configuration error:", (error as Error).message);
    return new Response("Webhook is not configured", { status: 500 });
  }

  // Anything that fails verification or parsing is the sender's problem: 400, nothing changes.
  let event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, secret);
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  const { alreadyProcessed } = await recordStripeEvent(event.id, event.type);
  if (alreadyProcessed) return Response.json({ received: true, duplicate: true });

  try {
    await handleStripeEvent(event);
    await finishStripeEvent(event.id);
  } catch (error) {
    console.error(`[stripe-webhook] ${event.type} failed:`, (error as Error).message);
    await finishStripeEvent(event.id, (error as Error).message).catch(() => {});
    return new Response("Processing failed", { status: 500 });
  }

  return Response.json({ received: true });
}
