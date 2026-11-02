"use server";

import { redirect } from "next/navigation";
import {
  attachCheckoutSession,
  closePendingOrder,
  createPendingOrder,
} from "@/db/queries/orders";
import { getCart, writeCartEntries } from "@/lib/cart-server";
import {
  ALLOWED_SHIPPING_COUNTRIES,
  CHECKOUT_TTL_SECONDS,
  CURRENCY,
  shippingFor,
} from "@/lib/checkout";
import { allowAttempt, clientIp } from "@/lib/rate-limit";
import { getSession } from "@/lib/session";
import { getSiteUrl, getStripe, INTEGRATION_IDENTIFIER } from "@/lib/stripe";

/**
 * Starts a Stripe Checkout for the current bag. The browser sends NOTHING: prices,
 * quantities and totals are rebuilt on the server from the cart cookie (slugs and
 * counts only) and live database prices. Errors go back to the bag via a query flag.
 */
export async function startCheckout(): Promise<void> {
  if (!(await allowAttempt(`action:checkout:ip:${await clientIp()}`, 10, 60))) {
    redirect("/cart?checkout=busy");
  }

  // 1. Revalidate stock and prices against live data.
  const cart = await getCart();
  if (cart.lines.length === 0) redirect("/cart");
  if (cart.lines.some((line) => line.status !== "ok")) {
    // Make the stored bag match what the customer was just shown, so the next attempt
    // is not blocked by the same lowered quantity. Sold-out lines stay until removed.
    await writeCartEntries(
      cart.lines.map((line) => ({
        slug: line.product.slug,
        qty: line.status === "reduced" ? line.quantity : line.requested,
      })),
    );
    redirect("/cart?checkout=changed");
  }

  const subtotalCents = cart.subtotalCents;
  const shippingCents = shippingFor(subtotalCents);
  const session = await getSession();

  // 2. Record the order (pending) with price snapshots. Nothing is paid or decremented yet.
  const order = await createPendingOrder({
    userId: session?.user.id ?? null,
    email: session?.user.email ?? null,
    subtotalCents,
    shippingCents,
    lines: cart.lines.map((line) => ({
      productId: line.product.id,
      name: line.product.name,
      unitPriceCents: line.product.priceCents,
      quantity: line.quantity,
    })),
  });

  // 3. Create the hosted Checkout Session from the same server-side numbers.
  let url: string | null = null;
  try {
    const site = getSiteUrl();
    const checkout = await getStripe().checkout.sessions.create(
      {
        mode: "payment",
        line_items: cart.lines.map((line) => ({
          quantity: line.quantity,
          price_data: {
            currency: CURRENCY,
            unit_amount: line.product.priceCents,
            product_data: {
              name: line.product.name,
              images: [line.product.image],
              metadata: { product_id: String(line.product.id) },
            },
          },
        })),
        shipping_address_collection: { allowed_countries: [...ALLOWED_SHIPPING_COUNTRIES] },
        shipping_options: [
          {
            shipping_rate_data: {
              type: "fixed_amount",
              fixed_amount: { amount: shippingCents, currency: CURRENCY },
              display_name: shippingCents === 0 ? "Complimentary shipping" : "Standard shipping",
            },
          },
        ],
        client_reference_id: order.id,
        metadata: { order_id: order.id },
        customer_email: session?.user.email ?? undefined,
        expires_at: Math.floor(Date.now() / 1000) + CHECKOUT_TTL_SECONDS,
        success_url: `${site}/checkout/return?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${site}/cart?checkout=cancelled`,
        integration_identifier: INTEGRATION_IDENTIFIER,
      },
      { idempotencyKey: `checkout-${order.id}` },
    );
    await attachCheckoutSession(order.id, checkout.id);
    url = checkout.url;
  } catch (error) {
    // Log the class of problem only: Stripe errors can echo request details.
    console.error("[checkout] could not create session:", (error as Error).name);
    await closePendingOrder(order.id, "failed", "session_create_failed");
    redirect("/cart?checkout=error");
  }

  if (!url) {
    await closePendingOrder(order.id, "failed", "session_without_url");
    redirect("/cart?checkout=error");
  }
  redirect(url);
}
