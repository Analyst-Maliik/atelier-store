import { AccountNav } from "@/components/account/account-nav";
import { getSession } from "@/lib/session";

/** Adds the role-dependent link. Reads the session, so render it inside <Suspense>. */
export async function AccountSidebar() {
  const session = await getSession();
  return <AccountNav isAdmin={session?.user.role === "admin" && !session.user.banned} />;
}
