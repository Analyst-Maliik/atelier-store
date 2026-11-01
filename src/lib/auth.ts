import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins/admin";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { getAuthSecret } from "@/lib/auth-secret";

const DAY = 60 * 60 * 24;

export const auth = betterAuth({
  secret: getAuthSecret(),
  database: drizzleAdapter(db, { provider: "pg", schema }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 10,
    maxPasswordLength: 128,
    // No email provider yet, so addresses are not verified in v1.
    autoSignIn: true,
  },
  session: {
    // Persistent, rolling: the expiry is pushed forward once a day while in use.
    expiresIn: 30 * DAY,
    updateAge: DAY,
    // No cookieCache: a cached copy of the session would stay valid for minutes after
    // sign-out, a ban or a role change. Every check reads the database instead.
  },
  // In-memory counters do not work across serverless instances.
  rateLimit: { enabled: true, storage: "database" },
  plugins: [
    admin({ defaultRole: "user", adminRoles: ["admin"] }),
    nextCookies(), // keep last
  ],
});
