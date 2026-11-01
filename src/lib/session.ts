import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

// Data-access layer for sessions. Pages and server actions that need a user call
// these directly; layouts and the proxy are not relied on for authorization.
// Reading headers makes the caller dynamic, so render it inside <Suspense>.

/** The current session, or null. Read from the database once per request. */
export const getSession = cache(async () =>
  auth.api.getSession({ headers: await headers() }),
);

function signInUrl(next: string) {
  return `/sign-in?next=${encodeURIComponent(next)}`;
}

/** Signed-in customer or redirect to sign-in. `next` is where to return afterwards. */
export async function requireUser(next: string) {
  const session = await getSession();
  if (!session) redirect(signInUrl(next));
  return session.user;
}

/** Admin or redirect. The role and ban flag come from the database, never from a cookie. */
export async function requireAdmin(next: string) {
  const session = await getSession();
  if (!session) redirect(signInUrl(next));
  if (session.user.banned || session.user.role !== "admin") redirect("/account");
  return session.user;
}
