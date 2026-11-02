import { recordAdminAudit, type AuditEntry } from "@/db/queries/admin";
import { allowAttempt } from "@/lib/rate-limit";
import { requireAdmin } from "@/lib/session";

// Every admin server action goes through adminAction(). Server actions are public POST
// endpoints, so hiding admin links or guarding pages protects nothing here: the role is
// re-checked, from the database, before the handler (and therefore any input) is touched.

type AdminUser = Awaited<ReturnType<typeof requireAdmin>>;

export type AdminActionResult<T> =
  | { status: "ok"; data: T }
  | { status: "error"; message: string };

const ACTIONS_PER_MINUTE = 60;

/**
 * 1. requireAdmin() first: a signed-out visitor, a non-admin and a banned admin are all
 *    redirected away and the handler never runs.
 * 2. Rate limit per admin and action.
 * 3. Run the handler, which validates its own input and returns the data plus an audit entry.
 * 4. Record the audit entry.
 *
 * Usage inside a "use server" file:
 *   export async function updateThing(_: State, formData: FormData) {
 *     return adminAction("thing.update", async (admin) => { ...; return { data, audit }; });
 *   }
 */
export async function adminAction<T>(
  name: string,
  handler: (admin: AdminUser) => Promise<{ data: T; audit: AuditEntry }>,
): Promise<AdminActionResult<T>> {
  const admin = await requireAdmin("/admin");

  if (!(await allowAttempt(`admin:${name}:${admin.id}`, ACTIONS_PER_MINUTE, 60))) {
    return { status: "error", message: "Too many changes in a short time. Wait a moment and try again." };
  }

  const { data, audit } = await handler(admin);

  // The change has already happened, so a failed audit write must not report a failure.
  try {
    await recordAdminAudit(admin.id, audit);
  } catch (error) {
    console.error(`[admin] audit write failed for ${name}:`, (error as Error).name);
  }
  return { status: "ok", data };
}
