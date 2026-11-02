import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getOrderWithItems } from "@/db/queries/orders";
import type { OrderStatus } from "@/db/schema";
import { AutoRefresh } from "@/components/checkout/auto-refresh";
import { isUuid } from "@/lib/checkout";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = {
  title: "Order | Atelier Store",
  robots: { index: false },
};

const headings: Record<OrderStatus, { eyebrow: string; title: string; body: string }> = {
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

/** Reads the database, so it renders inside <Suspense>. */
async function Confirmation({ params }: { params: PageProps<"/checkout/confirmation/[id]">["params"] }) {
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const found = await getOrderWithItems(id);
  if (!found) notFound();

  const { order, items } = found;
  const copy = headings[order.status];
  const retryable = order.status === "failed" || order.status === "expired";

  return (
    <div className="max-w-2xl">
      <p className="eyebrow text-muted mb-2">{copy.eyebrow}</p>
      <h1 className="heading-title">{copy.title}</h1>
      <p className="text-muted mt-3 max-w-md text-small" role="status">
        {copy.body}
      </p>
      {order.status === "pending" && <AutoRefresh />}

      <p className="eyebrow mt-10">Order AT-{order.orderNumber}</p>
      <ul className="mt-4 border-t border-line">
        {items.map((item) => (
          <li key={item.id} className="flex justify-between gap-4 border-b border-line py-4">
            <span>
              {item.name} <span className="text-muted">&times; {item.quantity}</span>
            </span>
            <span>{formatPrice(item.unitPriceCents * item.quantity)}</span>
          </li>
        ))}
      </ul>
      <dl className="mt-6 space-y-2 text-small">
        <div className="flex justify-between gap-4">
          <dt className="text-muted">Subtotal</dt>
          <dd>{formatPrice(order.subtotalCents)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted">Shipping</dt>
          <dd>{order.shippingCents === 0 ? "Free" : formatPrice(order.shippingCents)}</dd>
        </div>
        <div className="flex justify-between gap-4 border-t border-line pt-3 text-base">
          <dt>Total</dt>
          <dd>{formatPrice(order.totalCents)}</dd>
        </div>
      </dl>

      <div className="mt-10 flex flex-wrap gap-4">
        {retryable && (
          <Link href="/cart" className="btn btn-primary">
            Back to your bag
          </Link>
        )}
        <Link href="/new-arrivals" className={retryable ? "btn btn-outline" : "btn btn-primary"}>
          Continue shopping
        </Link>
      </div>
    </div>
  );
}

export default function ConfirmationPage({ params }: PageProps<"/checkout/confirmation/[id]">) {
  return (
    <>
      <div className="container-site">
        <nav aria-label="Breadcrumb" className="eyebrow text-muted flex gap-2 py-6">
          <Link href="/" className="hover:text-ink">Home</Link>
          <span aria-hidden>/</span>
          <span className="text-ink">Order</span>
        </nav>
      </div>
      <section className="container-site pb-section lg:pb-section-lg">
        <Suspense fallback={<div className="h-64" aria-hidden />}>
          <Confirmation params={params} />
        </Suspense>
      </section>
    </>
  );
}
