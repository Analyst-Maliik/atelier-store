import { getProducts } from "@/db/queries/catalog";
import { ProductCard } from "@/components/product/product-card";
import { SectionHeading } from "@/components/layout/section-heading";

export async function FeaturedProducts() {
  const products = await getProducts();
  return (
    <section className="container-site pb-section lg:pb-section-lg">
      <SectionHeading eyebrow="Just in" title="New arrivals" href="/collections/new" />
      <div className="product-grid">
        {products.map((p) => (
          <ProductCard key={p.slug} product={p} />
        ))}
      </div>
    </section>
  );
}
