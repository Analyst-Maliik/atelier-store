import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "Account | Atelier Store",
  robots: { index: false },
};

async function Overview() {
  const user = await requireUser("/account");
  const firstName = user.name.split(" ")[0];

  return (
    <>
      <h1 className="heading-title">Hello, {firstName}</h1>
      <p className="text-muted mt-3 max-w-md text-small">
        Review your orders and manage your details here. Addresses will appear as we add them.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        <Link href="/account/orders" className="panel block hover:border-ink">
          <p className="eyebrow text-muted mb-2">Orders</p>
          <p>Your orders</p>
          <p className="text-muted mt-1 text-small">Track and review what you have bought.</p>
        </Link>
        <Link href="/account/details" className="panel block hover:border-ink">
          <p className="eyebrow text-muted mb-2">Account details</p>
          <p>{user.name}</p>
          <p className="text-muted mt-1 break-all text-small">{user.email}</p>
        </Link>
        <Link href="/new-arrivals" className="panel block hover:border-ink">
          <p className="eyebrow text-muted mb-2">Keep browsing</p>
          <p>New arrivals</p>
          <p className="text-muted mt-1 text-small">See what has just joined the house.</p>
        </Link>
        {user.role === "admin" && !user.banned && (
          <Link href="/admin" className="panel block hover:border-ink">
            <p className="eyebrow text-muted mb-2">Administration</p>
            <p>Admin area</p>
            <p className="text-muted mt-1 text-small">Manage the store.</p>
          </Link>
        )}
      </div>
    </>
  );
}

function OverviewSkeleton() {
  return <div className="h-40" aria-hidden />;
}

export default function AccountPage() {
  return (
    <Suspense fallback={<OverviewSkeleton />}>
      <Overview />
    </Suspense>
  );
}
