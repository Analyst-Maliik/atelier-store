import { formatPrice } from "@/lib/format";

type Line = { id: number; name: string; quantity: number; unitPriceCents: number };

/** Order items with the amounts that were charged, then subtotal, shipping and total. */
export function OrderLines({
  items,
  subtotalCents,
  shippingCents,
  totalCents,
}: {
  items: Line[];
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
}) {
  return (
    <>
      <ul className="mt-4 border-t border-line">
        {items.map((item) => (
          <li key={item.id} className="flex justify-between gap-4 border-b border-line py-4">
            <span className="min-w-0">
              {item.name} <span className="text-muted">&times; {item.quantity}</span>
              {item.quantity > 1 && (
                <span className="text-muted block text-small">
                  {formatPrice(item.unitPriceCents)} each
                </span>
              )}
            </span>
            <span className="shrink-0">{formatPrice(item.unitPriceCents * item.quantity)}</span>
          </li>
        ))}
      </ul>
      <dl className="mt-6 space-y-2 text-small">
        <div className="flex justify-between gap-4">
          <dt className="text-muted">Subtotal</dt>
          <dd>{formatPrice(subtotalCents)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted">Shipping</dt>
          <dd>{shippingCents === 0 ? "Free" : formatPrice(shippingCents)}</dd>
        </div>
        <div className="flex justify-between gap-4 border-t border-line pt-3 text-base">
          <dt>Total</dt>
          <dd>{formatPrice(totalCents)}</dd>
        </div>
      </dl>
    </>
  );
}
