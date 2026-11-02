"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, type ReactNode } from "react";

export type SectionNavItem = {
  label: string;
  href: string;
  /** Current only on this exact path (for an overview page that other tabs live under). */
  exact?: boolean;
};

type Props = { label: string; items: SectionNavItem[]; footer?: ReactNode };

function isCurrent(pathname: string, { href, exact }: SectionNavItem) {
  return exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

/** The links themselves. Takes the path as a prop so it can render before it is known. */
function NavLinks({ label, items, footer, pathname }: Props & { pathname: string }) {
  return (
    <nav
      aria-label={label}
      className="flex gap-6 overflow-x-auto border-b border-line lg:flex-col lg:gap-1 lg:overflow-visible lg:border-b-0"
    >
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-current={isCurrent(pathname, item) ? "page" : undefined}
          className="nav-link shrink-0 self-start whitespace-nowrap"
        >
          {item.label}
        </Link>
      ))}
      {footer}
    </nav>
  );
}

/** Reading the path is runtime-only data, so it lives in its own Suspense boundary. */
function CurrentPathNav(props: Props) {
  return <NavLinks {...props} pathname={usePathname()} />;
}

/** Section navigation: a tab row on small screens, a sidebar from lg up. */
export function SectionNav(props: Props) {
  return (
    // Until the path is known the links render with no tab marked current.
    <Suspense fallback={<NavLinks {...props} pathname="" />}>
      <CurrentPathNav {...props} />
    </Suspense>
  );
}
