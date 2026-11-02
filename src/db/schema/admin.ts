import { index, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth";

/** One row per successful admin change: who did what to which record, and when. */
export const adminAuditLog = pgTable(
  "admin_audit_log",
  {
    id: uuid().primaryKey().defaultRandom(),
    /** Null only if the account is deleted later; the action itself stays on record. */
    actorUserId: text().references(() => user.id, { onDelete: "set null" }),
    /** Dotted action name such as "product.update". */
    action: text().notNull(),
    targetType: text().notNull(),
    targetId: text().notNull(),
    /** Small structured details (changed fields, old and new values). No secrets or customer PII. */
    meta: jsonb(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("admin_audit_log_created_at_idx").on(t.createdAt),
    index("admin_audit_log_target_idx").on(t.targetType, t.targetId),
  ],
);
