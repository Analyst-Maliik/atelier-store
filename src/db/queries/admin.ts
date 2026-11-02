import { db } from "@/db";
import { adminAuditLog } from "@/db/schema";

// Admin data access is deliberately NOT cached: an admin must always see current data.
// Callers are server components and actions that have already run requireAdmin().

export type AuditEntry = {
  action: string;
  targetType: string;
  targetId: string | number;
  meta?: Record<string, unknown>;
};

export async function recordAdminAudit(actorUserId: string, entry: AuditEntry) {
  await db.insert(adminAuditLog).values({
    actorUserId,
    action: entry.action,
    targetType: entry.targetType,
    targetId: String(entry.targetId),
    meta: entry.meta ?? null,
  });
}
