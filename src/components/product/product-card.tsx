import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/format";
import { getStockState } from "@/lib/stock";
import type { Product } from "@/lib/types";

export function ProductCard({ product }: { product: Product }) {
  const soldOut = getStockState(product.stock) === "out-of-stock";
  const badge = soldOut ? "Sold out" : product.badge;

  return (
    <Link href={`/products/${product.slug}`} className="product-card">
      <div className="product-card__media relative">
        <Image
          src={product.image}
          alt={product.imageAlt}
          width={640}
          height={800}
          sizes="(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 48vw"
          className={soldOut ? "opacity-60" : undefined}
        />
        {badge && (
          <span className="eyebrow absolute left-3 top-3 bg-canvas px-2 py-1">
            {badge}
          </span>
        )}
      </div>
      <div className="space-y-0.5">
        <p className="eyebrow text-muted">{product.category.name}</p>
        <p className="product-card__name">{product.name}</p>
        <p className="product-card__price">{formatPrice(product.priceCents)}</p>
      </div>
    </Link>
  );
}
