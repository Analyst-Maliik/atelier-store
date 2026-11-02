import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AutoRefresh } from "@/components/checkout/auto-refresh";
import { OrderLines } from "@/components/orders/order-lines";
import { getOrderWithItemsForUser } from "@/db/queries/orders";
import { isUuid } from "@/lib/checkout";
import { ORDER_STATUS_COPY } from "@/lib/order-status";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "Order | Atelier Store",
  robots: { index: false },
};

const placedOn = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

/** Reads the session and the database, so it renders inside <Suspense>. */
async function OrderDetail({ params }: { params: PageProps<"/account/orders/[id]">["params"] }) {
  const { id } = await params;
  const user = await requireUser(`/account/orders/${id}`);
  if (!isUuid(id)) notFound();

  // Filtered by owner in the query itself. Someone else's order and a missing one both 404.
  const found = await getOrderWithItemsForUser(id, user.id);
  if (!found) notFound();

  const { order, items } = found;
  const copy = ORDER_STATUS_COPY[order.status];
  const retryable = order.status === "failed" || order.status === "expired";

  return (
    <div className="max-w-2xl">
      <p className="eyebrow text-muted mb-2">Order</p>
      <h1 className="heading-title">AT-{order.orderNumber}</h1>
      <p className="text-muted mt-3 text-small">Placed on {placedOn.format(order.createdAt)}</p>

      <div className="panel mt-8" role="status">
        <p className="eyebrow text-muted mb-2">{copy.eyebrow}</p>
        <p>{copy.title}</p>
        <p className="text-muted mt-2 max-w-md text-small">{copy.body}</p>
      </div>
      {order.status === "pending" && <AutoRefresh />}

      <h2 className="eyebrow mt-10">Items</h2>
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
        <Link href="/account" className={retryable ? "btn btn-outline" : "btn btn-primary"}>
          Back to your account
        </Link>
      </div>
    </div>
  );
}

export default function AccountOrderPage({ params }: PageProps<"/account/orders/[id]">) {
  return (
    <Suspense fallback={<div className="h-64" aria-hidden />}>
      <OrderDetail params={params} />
    </Suspense>
  );
}
