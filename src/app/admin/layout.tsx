import type { Metadata } from "next";
import { AdminNav } from "@/components/admin/admin-nav";

export const metadata: Metadata = {
  robots: { index: false },
};

// Layout only arranges the section. It does NOT authorize: layouts do not re-run on
// client navigation, so every page under /admin calls requireAdmin() itself, inside
// <Suspense> (it reads headers). The same goes for every admin server action, which
// must go through adminAction() in src/lib/admin-action.ts.
export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <section className="container-site py-section lg:py-section-lg">
      <div className="grid gap-10 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-16">
        <aside>
          <p className="eyebrow text-muted mb-4 hidden lg:block">Admin</p>
          <AdminNav />
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </section>
  );
}
