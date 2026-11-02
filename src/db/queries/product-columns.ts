import { categories, products } from "@/db/schema";
import type { Product } from "@/lib/types";

// Shared by the cached catalogue queries and the uncached cart queries so both
// return the same Product shape.

export const productColumns = {
  id: products.id,
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

export function toProduct(row: {
  id: number;
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
