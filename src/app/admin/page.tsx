import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { requireAdmin } from "@/lib/session";

export const metadata: Metadata = {
  title: "Admin | Atelier Store",
};

async function AdminOverview() {
  const admin = await requireAdmin("/admin");

  return (
    <>
      <h1 className="heading-title">Administration</h1>
      <p className="text-muted mt-3 max-w-md text-small">Signed in as {admin.email}.</p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        <Link href="/admin/products" className="panel block hover:border-ink">
          <p className="eyebrow text-muted mb-2">Catalogue</p>
          <p>Products</p>
          <p className="text-muted mt-1 text-small">Prices, stock and what the store sells.</p>
        </Link>
      </div>
    </>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={<div className="h-40" aria-hidden />}>
      <AdminOverview />
    </Suspense>
  );
}
