import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { requireAdmin } from "@/lib/session";

export const metadata: Metadata = {
  title: "Admin | Atelier Store",
  robots: { index: false },
};

async function AdminDashboard() {
  const user = await requireAdmin("/admin");

  return (
    <>
      <h1 className="heading-title">Administration</h1>
      <p className="text-muted mt-4 text-small">
        Signed in as {user.email}. Catalogue and stock management will live here.
      </p>
      <Link href="/account" className="btn btn-outline mt-10">
        Back to account
      </Link>
    </>
  );
}

export default function AdminPage() {
  return (
    <section className="container-site py-section lg:py-section-lg">
      <div className="max-w-xl">
        <p className="eyebrow text-muted mb-2">Admin</p>
        <Suspense>
          <AdminDashboard />
        </Suspense>
      </div>
    </section>
  );
}
