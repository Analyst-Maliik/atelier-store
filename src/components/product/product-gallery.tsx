import Image from "next/image";
import type { Product } from "@/lib/types";

/**
 * Large stacked imagery on desktop, a snap-scrolling strip on mobile.
 * The catalogue has one photo per product, so the second frame is a
 * close crop of the same image until real galleries exist.
 */
export function ProductGallery({ product }: { product: Product }) {
  const sizes = "(min-width: 1024px) 38vw, 100vw";

  return (
    <div className="-mx-gutter flex snap-x snap-mandatory gap-1 overflow-x-auto md:mx-0 md:grid md:grid-cols-2 md:gap-2 md:overflow-visible lg:grid-cols-2">
      <div className="product-card__media relative aspect-[4/5] w-full shrink-0 snap-center max-md:w-[88%] md:col-span-2">
        <Image
          src={product.image}
          alt={product.imageAlt}
          fill
          priority
          sizes={sizes}
          className="object-cover"
        />
      </div>
      <div className="relative aspect-[4/5] w-full shrink-0 snap-center overflow-hidden bg-surface max-md:w-[88%]">
        <Image
          src={product.image}
          alt={`${product.imageAlt}, detail`}
          fill
          sizes={sizes}
          className="scale-[1.8] object-cover object-[50%_35%]"
        />
      </div>
      <div className="relative aspect-[4/5] w-full shrink-0 snap-center overflow-hidden bg-surface max-md:w-[88%]">
        <Image
          src={product.image}
          alt={`${product.imageAlt}, close up`}
          fill
          sizes={sizes}
          className="scale-[2.4] object-cover object-[30%_70%]"
        />
      </div>
    </div>
  );
}
