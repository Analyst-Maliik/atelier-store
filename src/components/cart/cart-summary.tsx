import Link from "next/link";
import { startCheckout } from "@/app/actions/checkout";
import { CheckoutButton } from "@/components/checkout/checkout-button";
import { FREE_SHIPPING_THRESHOLD_CENTS, shippingFor } from "@/lib/checkout";
import { formatPrice } from "@/lib/format";

export function CartSummary({
  itemCount,
  subtotalCents,
  unavailableCount,
}: {
  itemCount: number;
  subtotalCents: number;
  /** Lines that are sold out and therefore left out of the subtotal. */
  unavailableCount: number;
}) {
  const hasItems = itemCount > 0;
  // Same rule the server uses to charge, so the figure shown here is the figure paid.
  const shippingCents = shippingFor(subtotalCents);
  const untilFreeCents = FREE_SHIPPING_THRESHOLD_CENTS - subtotalCents;
  const blocked = unavailableCount > 0;

  return (
    <aside aria-label="Order summary" className="panel flex flex-col gap-6 lg:sticky lg:top-28">
      <h2 className="eyebrow">Summary</h2>
      <dl className="space-y-3">
        <div className="flex justify-between gap-4">
          <dt className="text-muted">
            Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})
          </dt>
          <dd>{formatPrice(subtotalCents)}</dd>
        </div>
        {hasItems && (
          <>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Shipping</dt>
              <dd>{shippingCents === 0 ? "Free" : formatPrice(shippingCents)}</dd>
            </div>
            <div className="flex justify-between gap-4 border-t border-line pt-3">
              <dt>Total</dt>
              <dd>{formatPrice(subtotalCents + shippingCents)}</dd>
            </div>
          </>
        )}
      </dl>
      {hasItems && untilFreeCents > 0 && (
        <p className="text-muted text-small">
          Add {formatPrice(untilFreeCents)} more for free shipping.
        </p>
      )}
      {blocked && (
        <p className="text-small text-accent">
          {unavailableCount === 1
            ? "1 sold-out item is not included. Remove it to continue."
            : `${unavailableCount} sold-out items are not included. Remove them to continue.`}
        </p>
      )}
      <p className="text-muted text-small">
        We ship within the United States. You enter your address and pay on Stripe&apos;s secure
        page.
      </p>
      <div className="space-y-3">
        {/* Posts nothing: the server rebuilds the order from the cart cookie and live prices. */}
        <form action={startCheckout}>
          <CheckoutButton disabled={!hasItems || blocked} />
        </form>
        <Link href="/new-arrivals" className="btn btn-outline btn-block">
          Continue shopping
        </Link>
      </div>
    </aside>
  );
}
