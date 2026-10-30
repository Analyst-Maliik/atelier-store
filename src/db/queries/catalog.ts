"use cache";

import { asc, desc, eq, ne, sql } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/db";
import { categories, products } from "@/db/schema";
import type { Product } from "@/lib/types";

// Every export here is cached and tagged "products" so a future stock or
// price update can call revalidateTag("products").

const columns = {
  slug: products.slug,
  name: products.name,
  description: products.description,
  details: products.details,
  categorySlug: categories.slug,
  categoryName: categories.name,
  priceCents: products.priceCents,
  stock: products.stockQuantity,
  image: products.imageUrl,
  imageAlt: products.imageAlt,
  badge: products.badge,
};

function toProduct(row: {
  slug: string;
  name: string;
  description: string;
  details: string[];
  categorySlug: string;
  categoryName: string;
  priceCents: number;
  stock: number;
  image: string;
  imageAlt: string;
  badge: string | null;
}): Product {
  const { categorySlug, categoryName, ...rest } = row;
  return { ...rest, category: { slug: categorySlug, name: categoryName } };
}

export async function getProducts(): Promise<Product[]> {
  cacheLife("minutes");
  cacheTag("products");

  const rows = await db
    .select(columns)
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .orderBy(asc(products.id));
  return rows.map(toProduct);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  cacheLife("minutes");
  cacheTag("products");

  const [row] = await db
    .select(columns)
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(eq(products.slug, slug))
    .limit(1);
  return row ? toProduct(row) : null;
}

/** Same-category products first, then the rest, excluding the given one. */
export async function getRelatedProducts(
  slug: string,
  categorySlug: string,
  limit = 4,
): Promise<Product[]> {
  cacheLife("minutes");
  cacheTag("products");

  const rows = await db
    .select(columns)
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(ne(products.slug, slug))
    .orderBy(desc(sql`${categories.slug} = ${categorySlug}`), asc(products.id))
    .limit(limit);
  return rows.map(toProduct);
}

export async function getProductSlugs(): Promise<string[]> {
  cacheLife("minutes");
  cacheTag("products");

  const rows = await db
    .select({ slug: products.slug })
    .from(products)
    .orderBy(asc(products.id));
  return rows.map((r) => r.slug);
}
