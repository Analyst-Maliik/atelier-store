import type { Metadata } from "next";
import { Suspense } from "react";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "Account details | Atelier Store",
  robots: { index: false },
};

const memberSince = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

async function Details() {
  const user = await requireUser("/account/details");

  const rows = [
    { label: "Name", value: user.name },
    { label: "Email", value: user.email },
    { label: "Member since", value: memberSince.format(user.createdAt) },
    { label: "Account type", value: user.role === "admin" ? "Administrator" : "Customer" },
  ];

  return (
    <dl className="mt-10 grid border-t border-line">
      {rows.map((row) => (
        <div
          key={row.label}
          className="grid gap-1 border-b border-line py-5 sm:grid-cols-[12rem_minmax(0,1fr)] sm:gap-6"
        >
          <dt className="eyebrow text-muted">{row.label}</dt>
          <dd className="break-words">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export default function AccountDetailsPage() {
  return (
    <>
      <h1 className="heading-title">Account details</h1>
      <p className="text-muted mt-3 max-w-md text-small">
        The details linked to your sign-in. Editing is coming soon.
      </p>
      <Suspense fallback={<div className="mt-10 h-48 border-t border-line" aria-hidden />}>
        <Details />
      </Suspense>
    </>
  );
}
