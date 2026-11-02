import { signOut } from "@/app/actions/auth";
import { SectionNav, type SectionNavItem } from "@/components/layout/section-nav";

const baseItems: SectionNavItem[] = [
  { label: "Overview", href: "/account", exact: true },
  { label: "Orders", href: "/account/orders" },
  { label: "Account details", href: "/account/details" },
];

/** Account section navigation. The Admin link is only a convenience: /admin enforces the role itself. */
export function AccountNav({ isAdmin = false }: { isAdmin?: boolean }) {
  const items = isAdmin ? [...baseItems, { label: "Admin", href: "/admin" }] : baseItems;

  return (
    <SectionNav
      label="Account"
      items={items}
      footer={
        <form action={signOut} className="shrink-0 lg:mt-6">
          <button type="submit" className="nav-link text-muted hover:text-ink whitespace-nowrap">
            Sign out
          </button>
        </form>
      }
    />
  );
}
