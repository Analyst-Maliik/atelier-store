"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/app/actions/auth";

const baseItems = [
  { label: "Overview", href: "/account" },
  { label: "Account details", href: "/account/details" },
];

/** Account section navigation: a tab row on small screens, a sidebar from lg up. */
export function AccountNav({ isAdmin = false }: { isAdmin?: boolean }) {
  const pathname = usePathname();
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
          aria-current={pathname === item.href ? "page" : undefined}
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
