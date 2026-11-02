import { Suspense } from "react";
import { AccountNav } from "@/components/account/account-nav";
import { AccountSidebar } from "@/components/account/account-sidebar";

// Layout only arranges the section. It does not authorize: every page under
// /account calls requireUser() itself, since layouts do not re-run on navigation.
export default function AccountLayout({ children }: LayoutProps<"/account">) {
  return (
    <section className="container-site py-section lg:py-section-lg">
      <div className="grid gap-10 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-16">
        <aside>
          <p className="eyebrow text-muted mb-4 hidden lg:block">My account</p>
          {/* The static nav shows at once; the admin link appears when the session resolves. */}
          <Suspense fallback={<AccountNav />}>
            <AccountSidebar />
          </Suspense>
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </section>
  );
}
