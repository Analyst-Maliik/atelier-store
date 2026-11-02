import Link from "next/link";
import { SectionNav, type SectionNavItem } from "@/components/layout/section-nav";

// Add a tab here only when its route exists. Showing or hiding a link never protects a
// page: every /admin route and action calls requireAdmin() itself.
const items: SectionNavItem[] = [
  { label: "Overview", href: "/admin", exact: true },
  { label: "Products", href: "/admin/products" },
];

export function AdminNav() {
  return (
    <SectionNav
      label="Admin"
      items={items}
      footer={
        <Link href="/account" className="nav-link text-muted hover:text-ink shrink-0 whitespace-nowrap lg:mt-6">
          Back to account
        </Link>
      }
    />
  );
}
