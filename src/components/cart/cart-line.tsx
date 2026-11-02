import Image from "next/image";
import Link from "next/link";
import { maxQuantity } from "@/lib/cart";
import type { CartLine } from "@/lib/cart-server";
import { formatPrice } from "@/lib/format";
import { getStockState } from "@/lib/stock";
import { StockStatus } from "@/components/product/stock-status";
import { CartLineControls } from "./cart-line-controls";

export function CartLineItem({ line }: { line: CartLine }) {
  const { product, quantity, status } = line;
  const soldOut = status === "sold-out";
  const max = maxQuantity(product.stock);
  const lowStock = status === "ok" && getStockState(product.stock) === "low-stock";

  return (
    // Dims and ignores clicks while any control in the row is busy (see cart-line-controls).
    <li className="grid grid-cols-[6rem_minmax(0,1fr)] gap-5 border-b border-line py-6 transition-opacity has-[[aria-busy=true]]:pointer-events-none has-[[aria-busy=true]]:opacity-60 sm:grid-cols-[8rem_minmax(0,1fr)] sm:gap-8">
      <Link href={`/products/${product.slug}`} className="product-card__media block">
        <Image
          src={product.image}
          alt={product.imageAlt}
          width={256}
          height={320}
          sizes="128px"
          className={soldOut ? "opacity-60" : undefined}
        />
      </Link>

      <div className="flex min-w-0 flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 space-y-1">
            <p className="eyebrow text-muted">{product.category.name}</p>
            <Link href={`/products/${product.slug}`} className="block hover:underline">
              {product.name}
            </Link>
            <p className="text-muted text-small">{formatPrice(product.priceCents)}</p>
          </div>
          <p className={soldOut ? "text-muted" : undefined}>
            {soldOut ? "—" : formatPrice(line.lineTotalCents)}
          </p>
        </div>

        {lowStock && <StockStatus stock={product.stock} />}
        {status === "reduced" && (
          <p className="text-small text-accent">
            Only {product.stock} left, so we lowered the quantity to {quantity}.
          </p>
        )}
        {soldOut && (
          <p className="text-small text-accent">
            This item is now sold out and is not included in your total. Remove it to continue.
          </p>
        )}

        <CartLineControls
          slug={product.slug}
          name={product.name}
          quantity={quantity}
          max={max}
          maxLabel={product.stock <= quantity ? "Maximum available" : "Maximum per order"}
          soldOut={soldOut}
        />
      </div>
    </li>
  );
}
