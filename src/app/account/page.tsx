import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { signOut } from "@/app/actions/auth";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "Account | Atelier Store",
  robots: { index: false },
};

async function AccountDetails() {
  const user = await requireUser("/account");

  return (
    <>
      <h1 className="heading-title">Hello, {user.name}</h1>
      <dl className="mt-10 grid gap-6 border-t border-line pt-8 sm:grid-cols-2">
        <div>
          <dt className="eyebrow text-muted mb-2">Name</dt>
          <dd>{user.name}</dd>
        </div>
        <div>
          <dt className="eyebrow text-muted mb-2">Email</dt>
          <dd className="break-all">{user.email}</dd>
        </div>
      </dl>

      <div className="mt-12 flex flex-wrap gap-4">
        {user.role === "admin" && (
          <Link href="/admin" className="btn btn-outline">
            Admin
          </Link>
        )}
        <form action={signOut}>
          <button type="submit" className="btn btn-primary">
            Sign out
          </button>
        </form>
      </div>
    </>
  );
}

export default function AccountPage() {
  return (
    <section className="container-site py-section lg:py-section-lg">
      <div className="max-w-xl">
        <p className="eyebrow text-muted mb-2">Your account</p>
        <Suspense>
          <AccountDetails />
        </Suspense>
      </div>
    </section>
  );
}
