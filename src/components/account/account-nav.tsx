"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { signOut } from "@/app/actions/auth";

const baseItems = [
  { label: "Overview", href: "/account" },
  { label: "Orders", href: "/account/orders" },
  { label: "Account details", href: "/account/details" },
];

/** Overview matches only itself; the other tabs also stay current on their sub-pages. */
function isCurrent(pathname: string, href: string) {
  return href === "/account" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

/** The links themselves. Takes the path as a prop so it can render before it is known. */
function NavLinks({ isAdmin, pathname }: { isAdmin: boolean; pathname: string }) {
  const items = isAdmin ? [...baseItems, { label: "Admin", href: "/admin" }] : baseItems;

  return (
    <nav
      aria-label="Account"
      className="flex gap-6 overflow-x-auto border-b border-line lg:flex-col lg:gap-1 lg:overflow-visible lg:border-b-0"
    >
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-current={isCurrent(pathname, item.href) ? "page" : undefined}
          className="nav-link shrink-0 self-start whitespace-nowrap"
        >
          {item.label}
        </Link>
      ))}
      <form action={signOut} className="shrink-0 lg:mt-6">
        <button type="submit" className="nav-link text-muted hover:text-ink whitespace-nowrap">
          Sign out
        </button>
      </form>
    </nav>
  );
}

/** Reading the path is runtime-only data, so it lives in its own Suspense boundary. */
function CurrentPathNav({ isAdmin }: { isAdmin: boolean }) {
  return <NavLinks isAdmin={isAdmin} pathname={usePathname()} />;
}

/** Account section navigation: a tab row on small screens, a sidebar from lg up. */
export function AccountNav({ isAdmin = false }: { isAdmin?: boolean }) {
  return (
    // Until the path is known the links render with no tab marked current.
    <Suspense fallback={<NavLinks isAdmin={isAdmin} pathname="" />}>
      <CurrentPathNav isAdmin={isAdmin} />
    </Suspense>
  );
}
