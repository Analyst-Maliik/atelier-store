import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getOrderWithItems } from "@/db/queries/orders";
import { AutoRefresh } from "@/components/checkout/auto-refresh";
import { OrderLines } from "@/components/orders/order-lines";
import { isUuid } from "@/lib/checkout";
import { ORDER_STATUS_COPY } from "@/lib/order-status";
import { getSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Order | Atelier Store",
  robots: { index: false },
};

/** Reads the database, so it renders inside <Suspense>. */
async function Confirmation({ params }: { params: PageProps<"/checkout/confirmation/[id]">["params"] }) {
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const found = await getOrderWithItems(id);
  if (!found) notFound();

  const { order, items } = found;
  const copy = ORDER_STATUS_COPY[order.status];
  const retryable = order.status === "failed" || order.status === "expired";
  // Guests can open this page by link; only the signed-in owner is offered the account view.
  const session = await getSession();
  const isOwner = Boolean(order.userId) && session?.user.id === order.userId;

  return (
    <div className="max-w-2xl">
      <p className="eyebrow text-muted mb-2">{copy.eyebrow}</p>
      <h1 className="heading-title">{copy.title}</h1>
      <p className="text-muted mt-3 max-w-md text-small" role="status">
        {copy.body}
      </p>
      {order.status === "pending" && <AutoRefresh />}

      <p className="eyebrow mt-10">Order AT-{order.orderNumber}</p>
      <OrderLines
        items={items}
        subtotalCents={order.subtotalCents}
        shippingCents={order.shippingCents}
        totalCents={order.totalCents}
      />

      <div className="mt-10 flex flex-wrap gap-4">
        {retryable && (
          <Link href="/cart" className="btn btn-primary">
            Back to your bag
          </Link>
        )}
        <Link href="/new-arrivals" className={retryable ? "btn btn-outline" : "btn btn-primary"}>
          Continue shopping
        </Link>
        {isOwner && (
          <Link href={`/account/orders/${order.id}`} className="btn btn-outline">
            View in your account
          </Link>
        )}
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
