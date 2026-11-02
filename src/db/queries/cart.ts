import { inArray, eq } from "drizzle-orm";
import { db } from "@/db";
import { categories, products } from "@/db/schema";
import { productColumns, toProduct } from "@/db/queries/product-columns";
import type { Product } from "@/lib/types";

// Deliberately NOT cached (unlike catalog.ts): the cart must see the current price
// and stock, not a copy that can be a minute old.

export async function getProductsBySlugs(slugs: string[]): Promise<Product[]> {
  if (slugs.length === 0) return [];
  const rows = await db
    .select(productColumns)
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(inArray(products.slug, slugs));
  return rows.map(toProduct);
}
