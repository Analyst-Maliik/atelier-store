import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { listOrdersForUser } from "@/db/queries/orders";
import { formatOrderDate, formatPrice } from "@/lib/format";
import { ORDER_STATUS_LABEL } from "@/lib/order-status";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "Orders | Atelier Store",
  robots: { index: false },
};

/** Reads the session and the database, so it renders inside <Suspense>. */
async function OrderList() {
  const user = await requireUser("/account/orders");
  const orders = await listOrdersForUser(user.id);

  if (orders.length === 0) {
    return (
      <div className="panel mt-10 py-section text-center">
        <p className="heading-title">No orders yet</p>
        <p className="text-muted mx-auto mt-3 max-w-sm text-small">
          When you place an order, it will appear here.
        </p>
        <div className="mt-8">
          <Link href="/new-arrivals" className="btn btn-primary">
            New arrivals
          </Link>
        </div>
      </div>
    );
  }

  return (
    <ul className="mt-10 border-t border-line">
      {orders.map((order) => (
        <li key={order.id} className="border-b border-line">
          <Link
            href={`/account/orders/${order.id}`}
            className="grid gap-x-6 gap-y-1 py-5 hover:bg-surface sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
          >
            <span className="min-w-0">
              <span className="block">Order AT-{order.orderNumber}</span>
              <span className="text-muted block text-small">
                {formatOrderDate(order.createdAt)} &middot; {order.itemCount}{" "}
                {order.itemCount === 1 ? "item" : "items"}
              </span>
            </span>
            <span className="flex items-baseline justify-between gap-6 sm:block sm:text-right">
              <span className="eyebrow text-muted">{ORDER_STATUS_LABEL[order.status]}</span>
              <span className="block">{formatPrice(order.totalCents)}</span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default function OrdersPage() {
  return (
    <>
      <h1 className="heading-title">Orders</h1>
      <p className="text-muted mt-3 max-w-md text-small">Your recent orders, newest first.</p>
      <Suspense fallback={<div className="mt-10 h-48 border-t border-line" aria-hidden />}>
        <OrderList />
      </Suspense>
    </>
  );
}
