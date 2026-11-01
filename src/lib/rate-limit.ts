import { createHash } from "node:crypto";
import { sql } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/db";
import { rateLimit } from "@/db/schema";

// Better Auth's own limiter only sees requests to /api/auth/*. Our server actions call
// auth.api.* directly, so they get this fixed-window limiter, stored in the same
// `rate_limit` table (shared across serverless instances).

/** Counts an attempt for `key`; false once more than `max` happened within the window. */
export async function allowAttempt(
  key: string,
  max: number,
  windowSeconds: number,
): Promise<boolean> {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const expired = sql`${now}::bigint - ${rateLimit.lastRequest} > ${windowMs}`;

  const [row] = await db
    .insert(rateLimit)
    .values({ id: key, key, count: 1, lastRequest: now })
    .onConflictDoUpdate({
      target: rateLimit.key,
      set: {
        count: sql`case when ${expired} then 1 else ${rateLimit.count} + 1 end`,
        lastRequest: sql`case when ${expired} then ${now}::bigint else ${rateLimit.lastRequest} end`,
      },
    })
    .returning({ count: rateLimit.count });

  return row.count <= max;
}

export async function clientIp(): Promise<string> {
  const h = await headers();
  return (
    h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown"
  );
}

/** Stable key part for an email, hashed so addresses are not stored in the table. */
export function emailKey(email: string): string {
  return createHash("sha256").update(email).digest("hex").slice(0, 32);
}
