import { readCartEntries } from "@/lib/cart-server";

/** Cookie-only (no database), so it is cheap. Reads cookies: render inside <Suspense>. */
export async function BagCount() {
  const entries = await readCartEntries();
  const count = entries.reduce((sum, e) => sum + e.qty, 0);
  return <>Bag ({count})</>;
}
