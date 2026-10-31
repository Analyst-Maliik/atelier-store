import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/db";
import { getAuthSecret } from "@/lib/auth-secret";

export const auth = betterAuth({
  secret: getAuthSecret(),
  database: drizzleAdapter(db, { provider: "pg" }),
  plugins: [nextCookies()],
});
