import Link from "next/link";
import { formatPrice } from "@/lib/format";
import { getStockState } from "@/lib/stock";
import type { Product } from "@/lib/types";
import { AddToBagForm } from "@/components/cart/add-to-bag-form";
import { StockStatus } from "./stock-status";

export function ProductInfo({ product }: { product: Product }) {
  const soldOut = getStockState(product.stock) === "out-of-stock";

  return (
    <div className="flex flex-col gap-8">
      <header className="space-y-3">
        <Link
          href={`/collections/${product.category.slug}`}
          className="eyebrow text-muted link"
        >
          {product.category.name}
        </Link>
        <h1 className="heading-title">{product.name}</h1>
        <p className="text-lg">{formatPrice(product.priceCents)}</p>
        <StockStatus stock={product.stock} />
      </header>

      <div className="space-y-3">
        <AddToBagForm slug={product.slug} soldOut={soldOut} />
        <p className="text-muted text-small text-center">
          Complimentary shipping on orders over $250. Free returns within 30 days.
        </p>
      </div>

      <p className="text-muted max-w-prose">{product.description}</p>

      <div className="rule">
        <details className="group border-b border-line" open>
          <summary className="eyebrow flex cursor-pointer list-none items-center justify-between py-5">
            Details
            <span aria-hidden className="text-base leading-none group-open:hidden">+</span>
            <span aria-hidden className="hidden text-base leading-none group-open:inline">&minus;</span>
          </summary>
          <ul className="text-muted space-y-2 pb-6 text-small">
            {product.details.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </details>
        <details className="group border-b border-line">
          <summary className="eyebrow flex cursor-pointer list-none items-center justify-between py-5">
            Shipping &amp; returns
            <span aria-hidden className="text-base leading-none group-open:hidden">+</span>
            <span aria-hidden className="hidden text-base leading-none group-open:inline">&minus;</span>
          </summary>
          <p className="text-muted pb-6 text-small">
            Orders ship within 2 business days. Returns are free within 30 days of delivery
            for items in original condition.
          </p>
        </details>
      </div>
    </div>
  );
}
