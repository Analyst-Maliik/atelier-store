// Grant or remove the admin role: `npm run auth:make-admin -- <email> [--demote]`.
// The account must already exist (sign up first). There is no auto-promotion.
import { config } from "dotenv";
import { eq } from "drizzle-orm";

config({ path: [".env.local", ".env"] });

async function main() {
  const args = process.argv.slice(2);
  const demote = args.includes("--demote");
  const email = args.find((a) => !a.startsWith("--"))?.trim().toLowerCase();
  if (!email) {
    console.error("Usage: npm run auth:make-admin -- <email> [--demote]");
    process.exit(1);
  }

  // Imported after dotenv has populated process.env (src/db/index.ts reads it on load).
  const { db } = await import("./index");
  const { user } = await import("./schema");

  const updated = await db
    .update(user)
    .set({ role: demote ? "user" : "admin" })
    .where(eq(user.email, email))
    .returning({ id: user.id });

  if (updated.length === 0) {
    console.error("No user found with that email.");
    process.exit(1);
  }
  console.log(demote ? "Role set to user." : "Role set to admin.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
