"use cache";

import { and, asc, desc, eq, ilike, ne, or, sql } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/db";
import { categories, products } from "@/db/schema";
import { escapeLike, MAX_TERMS } from "@/lib/search";
import { productColumns as columns, toProduct } from "@/db/queries/product-columns";
import type { Product } from "@/lib/types";

// Every export here is cached and tagged "products" so a future stock or
// price update can call revalidateTag("products").

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

/** Most recently added first; id breaks ties for rows created in one batch. */
export async function getNewArrivals(limit = 24): Promise<Product[]> {
  cacheLife("minutes");
  cacheTag("products");

  const rows = await db
    .select(columns)
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .orderBy(desc(products.createdAt), desc(products.id))
    .limit(limit);
  return rows.map(toProduct);
}

export async function getCategoryBySlug(
  slug: string,
): Promise<{ slug: string; name: string } | null> {
  cacheLife("minutes");
  cacheTag("products");

  const [row] = await db
    .select({ slug: categories.slug, name: categories.name })
    .from(categories)
    .where(eq(categories.slug, slug))
    .limit(1);
  return row ?? null;
}

export async function getCategories(): Promise<{ slug: string; name: string }[]> {
  cacheLife("minutes");
  cacheTag("products");

  return db
    .select({ slug: categories.slug, name: categories.name })
    .from(categories)
    .orderBy(asc(categories.id));
}

export async function getCategorySlugs(): Promise<string[]> {
  return (await getCategories()).map((c) => c.slug);
}

export async function getProductsByCategory(categorySlug: string): Promise<Product[]> {
  cacheLife("minutes");
  cacheTag("products");

  const rows = await db
    .select(columns)
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(eq(categories.slug, categorySlug))
    .orderBy(desc(products.createdAt), desc(products.id));
  return rows.map(toProduct);
}

/**
 * Every word must appear in the name, description or category name (case-insensitive).
 * Name matches rank first, then category, then description; newest first within a rank.
 * Pass the output of normalizeQuery().
 */
export async function searchProducts(query: string, limit = 48): Promise<Product[]> {
  cacheLife("minutes");
  cacheTag("products");

  const terms = query.split(" ").filter(Boolean).slice(0, MAX_TERMS);
  if (terms.length === 0) return [];

  const matchesTerm = (term: string) => {
    const pattern = `%${escapeLike(term)}%`;
    return or(
      ilike(products.name, pattern),
      ilike(categories.name, pattern),
      ilike(products.description, pattern),
    );
  };
  const namePattern = `%${escapeLike(terms.join(" "))}%`;

  const rows = await db
    .select(columns)
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(and(...terms.map(matchesTerm)))
    .orderBy(
      sql`case when ${products.name} ilike ${namePattern} then 0
               when ${categories.name} ilike ${namePattern} then 1
               else 2 end`,
      desc(products.createdAt),
      desc(products.id),
    )
    .limit(limit);
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
