// Pure cart helpers, safe for server and client. The cart lives in an HttpOnly cookie
// holding only { slug, quantity }. Prices, names and stock are NEVER stored there:
// the server looks them up fresh on every read (see lib/cart-server.ts).

export const CART_COOKIE = "atelier_cart";
export const CART_MAX_AGE = 60 * 60 * 24 * 30;
export const MAX_LINES = 20;
export const MAX_QTY_PER_LINE = 10;

const MAX_COOKIE_LENGTH = 4000;
const SLUG_PATTERN = /^[a-z0-9-]{1,100}$/;

export type CartEntry = { slug: string; qty: number };

export function isValidSlug(value: unknown): value is string {
  return typeof value === "string" && SLUG_PATTERN.test(value);
}

/** Most units of a product the bag may hold: limited by stock and the per-line cap. */
export function maxQuantity(stock: number): number {
  return Math.max(0, Math.min(Math.trunc(stock), MAX_QTY_PER_LINE));
}

/** Parses the cookie defensively. Anything unexpected is dropped, never thrown. */
export function parseCart(raw: string | undefined): CartEntry[] {
  if (!raw || raw.length > MAX_COOKIE_LENGTH) return [];
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(data)) return [];

  const seen = new Set<string>();
  const entries: CartEntry[] = [];
  for (const item of data) {
    if (entries.length >= MAX_LINES) break;
    if (typeof item !== "object" || item === null) continue;
    const { s, q } = item as { s?: unknown; q?: unknown };
    if (!isValidSlug(s) || seen.has(s)) continue;
    if (typeof q !== "number" || !Number.isInteger(q) || q < 1) continue;
    seen.add(s);
    entries.push({ slug: s, qty: Math.min(q, MAX_QTY_PER_LINE) });
  }
  return entries;
}

export function serializeCart(entries: CartEntry[]): string {
  return JSON.stringify(entries.map((e) => ({ s: e.slug, q: e.qty })));
}
