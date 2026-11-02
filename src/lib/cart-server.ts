import { cookies } from "next/headers";
import { getProductsBySlugs } from "@/db/queries/cart";
import {
  CART_COOKIE,
  CART_MAX_AGE,
  maxQuantity,
  parseCart,
  serializeCart,
  type CartEntry,
} from "@/lib/cart";
import type { Product } from "@/lib/types";

// Reads the cookie, so anything calling these is dynamic: render it inside <Suspense>.

export async function readCartEntries(): Promise<CartEntry[]> {
  const jar = await cookies();
  return parseCart(jar.get(CART_COOKIE)?.value);
}

/** Server actions and route handlers only: components cannot set cookies while rendering. */
export async function writeCartEntries(entries: CartEntry[]): Promise<void> {
  const jar = await cookies();
  if (entries.length === 0) {
    jar.delete(CART_COOKIE);
    return;
  }
  jar.set(CART_COOKIE, serializeCart(entries), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: CART_MAX_AGE,
  });
}

/** Route handlers and server actions only. */
export async function clearCart(): Promise<void> {
  (await cookies()).delete(CART_COOKIE);
}

export type CartLine = {
  product: Product;
  /** Units that count towards the total, after clamping to current stock. */
  quantity: number;
  /** What the bag asked for. */
  requested: number;
  lineTotalCents: number;
  /** ok, quantity lowered because stock dropped, or no stock left. */
  status: "ok" | "reduced" | "sold-out";
};

export type Cart = {
  lines: CartLine[];
  itemCount: number;
  subtotalCents: number;
};

/**
 * Rebuilds the bag from live product data. Prices and stock always come from the
 * database; lines for products that no longer exist are dropped.
 */
export async function getCart(): Promise<Cart> {
  const entries = await readCartEntries();
  const found = await getProductsBySlugs(entries.map((e) => e.slug));
  const bySlug = new Map(found.map((p) => [p.slug, p]));

  const lines: CartLine[] = [];
  for (const entry of entries) {
    const product = bySlug.get(entry.slug);
    if (!product) continue;

    const max = maxQuantity(product.stock);
    const quantity = Math.min(entry.qty, max);
    lines.push({
      product,
      quantity,
      requested: entry.qty,
      lineTotalCents: product.priceCents * quantity,
      status: max === 0 ? "sold-out" : quantity < entry.qty ? "reduced" : "ok",
    });
  }

  return {
    lines,
    itemCount: lines.reduce((sum, l) => sum + l.quantity, 0),
    subtotalCents: lines.reduce((sum, l) => sum + l.lineTotalCents, 0),
  };
}
