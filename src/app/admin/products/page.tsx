import type { Metadata } from "next";
import { Suspense } from "react";
import { adminListProducts } from "@/db/queries/admin-catalog";
import { formatOrderDate, formatPrice } from "@/lib/format";
import { requireAdmin } from "@/lib/session";
import { getStockState } from "@/lib/stock";

export const metadata: Metadata = {
  title: "Products | Admin | Atelier Store",
};

const stockLabel = {
  "in-stock": null,
  "low-stock": "Low stock",
  "out-of-stock": "Sold out",
} as const;

/** Reads the session and the database, so it renders inside <Suspense>. */
async function ProductList() {
  await requireAdmin("/admin/products"); // first line: nothing below runs for anyone else
  const products = await adminListProducts();

  if (products.length === 0) {
    return (
      <div className="panel mt-10 py-section text-center">
        <p className="heading-title">No products yet</p>
        <p className="text-muted mx-auto mt-3 max-w-sm text-small">
          Run the seed script to load the starter catalogue.
        </p>
      </div>
    );
  }

  return (
    <>
      <p className="eyebrow text-muted mt-10 mb-4">
        {products.length} {products.length === 1 ? "product" : "products"}
      </p>
      <ul className="border-t border-line">
        {products.map((product) => {
          const warning = stockLabel[getStockState(product.stock)];
          return (
            <li
              key={product.id}
              className="grid gap-x-6 gap-y-1 border-b border-line py-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
            >
              <span className="min-w-0">
                <span className="block">{product.name}</span>
                <span className="text-muted block text-small">
                  {product.categoryName} &middot; /{product.slug} &middot; updated{" "}
                  {formatOrderDate(product.updatedAt)}
                </span>
              </span>
              <span className="flex items-baseline justify-between gap-6 sm:block sm:text-right">
                <span className="block">{formatPrice(product.priceCents)}</span>
                <span className={warning ? "block text-small text-accent" : "text-muted block text-small"}>
                  {product.stock} in stock{warning ? ` · ${warning}` : ""}
                </span>
              </span>
            </li>
          );
        })}
      </ul>
    </>
  );
}

export default function AdminProductsPage() {
  return (
    <>
      <h1 className="heading-title">Products</h1>
      <p className="text-muted mt-3 max-w-md text-small">
        Everything in the catalogue as customers see it, with live stock. Editing comes next.
      </p>
      <Suspense fallback={<div className="mt-10 h-48 border-t border-line" aria-hidden />}>
        <ProductList />
      </Suspense>
    </>
  );
}
