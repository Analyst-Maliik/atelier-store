import { NextResponse, type NextRequest } from "next/server";
import { getOrderBySessionId } from "@/db/queries/orders";
import { clearCart } from "@/lib/cart-server";
import { applyCheckoutSession } from "@/lib/checkout-events";
import { isCheckoutSessionId } from "@/lib/checkout";
import { getStripe } from "@/lib/stripe";

/**
 * Where Stripe sends the customer after Checkout. The `session_id` in the URL is only a
 * lookup key, never proof of payment: we fetch the session from Stripe ourselves and let
 * the same idempotent logic as the webhook decide. The webhook remains the authority;
 * this just makes the confirmation page instant in the common case.
 */
export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("session_id");
  if (!isCheckoutSessionId(sessionId)) return NextResponse.redirect(new URL("/cart", request.url));

  const order = await getOrderBySessionId(sessionId);
  if (!order) return NextResponse.redirect(new URL("/cart", request.url));

  try {
    const session = await getStripe().checkout.sessions.retrieve(sessionId);
    await applyCheckoutSession(session);
  } catch (error) {
    // Stripe unreachable or a transient error: the webhook will still settle the order.
    console.error("[checkout-return] could not verify session:", (error as Error).name);
  }

  const fresh = await getOrderBySessionId(sessionId);
  const response = NextResponse.redirect(new URL(`/checkout/confirmation/${order.id}`, request.url));
  // Empty the bag only once the payment is really confirmed.
  if (fresh?.status === "paid" || fresh?.status === "refunded") await clearCart();
  return response;
}
