"use server";

import { getProductsBySlugs } from "@/db/queries/cart";
import {
  MAX_LINES,
  MAX_QTY_PER_LINE,
  isValidSlug,
  maxQuantity,
} from "@/lib/cart";
import { readCartEntries, writeCartEntries } from "@/lib/cart-server";
import { allowAttempt, clientIp } from "@/lib/rate-limit";

export type CartActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

function text(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

/** Looser than auth: cart actions are cheap reads, this only stops floods. */
async function withinLimit() {
  return allowAttempt(`action:cart:ip:${await clientIp()}`, 60, 60);
}

/** Adds one unit. The browser only names the product; price and stock come from the database. */
export async function addToCart(
  _prev: CartActionState,
  formData: FormData,
): Promise<CartActionState> {
  const slug = text(formData, "slug");
  if (!isValidSlug(slug)) return { status: "error", message: "That product could not be found." };

  try {
    if (!(await withinLimit())) {
      return { status: "error", message: "Too many requests. Please wait a moment." };
    }

    const [product] = await getProductsBySlugs([slug]);
    if (!product) return { status: "error", message: "This product is no longer available." };

    const max = maxQuantity(product.stock);
    if (max === 0) return { status: "error", message: "Sorry, this item is sold out." };

    const entries = await readCartEntries();
    const existing = entries.find((e) => e.slug === slug);
    const current = existing ? Math.min(existing.qty, max) : 0;

    if (current >= max) {
      const limitedByCap = product.stock > MAX_QTY_PER_LINE;
      return {
        status: "error",
        message: limitedByCap
          ? `You can order up to ${MAX_QTY_PER_LINE} of this item.`
          : `Only ${product.stock} available, and you already have ${current} in your bag.`,
      };
    }
    if (!existing && entries.length >= MAX_LINES) {
      return { status: "error", message: "Your bag is full. Remove an item to add another." };
    }

    const next = existing
      ? entries.map((e) => (e.slug === slug ? { ...e, qty: current + 1 } : e))
      : [...entries, { slug, qty: 1 }];
    await writeCartEntries(next);
    return { status: "success", message: "Added to your bag." };
  } catch {
    return { status: "error", message: "Something went wrong. Please try again." };
  }
}

/** Sets a quantity, clamped to what is in stock. Zero or less removes the line. */
export async function setQuantity(formData: FormData): Promise<void> {
  const slug = text(formData, "slug");
  const requested = Number.parseInt(text(formData, "quantity"), 10);
  if (!isValidSlug(slug) || !Number.isFinite(requested)) return;
  if (!(await withinLimit())) return;

  const entries = await readCartEntries();
  if (!entries.some((e) => e.slug === slug)) return;

  let quantity = 0;
  if (requested > 0) {
    const [product] = await getProductsBySlugs([slug]);
    quantity = product ? Math.min(requested, maxQuantity(product.stock)) : 0;
  }

  await writeCartEntries(
    quantity > 0
      ? entries.map((e) => (e.slug === slug ? { ...e, qty: quantity } : e))
      : entries.filter((e) => e.slug !== slug),
  );
}

export async function removeFromCart(formData: FormData): Promise<void> {
  const slug = text(formData, "slug");
  if (!isValidSlug(slug)) return;

  const entries = await readCartEntries();
  if (entries.some((e) => e.slug === slug)) {
    await writeCartEntries(entries.filter((e) => e.slug !== slug));
  }
}
