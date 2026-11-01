import type { Metadata } from "next";
import Link from "next/link";
import { getNewArrivals } from "@/db/queries/catalog";
import { ProductCard } from "@/components/product/product-card";

export const metadata: Metadata = {
  title: "New Arrivals | Atelier Store",
  description: "The latest pieces to join the house, freshly added to the collection.",
};

export default async function NewArrivalsPage() {
  const products = await getNewArrivals();

  return (
    <>
      <div className="container-site">
        <nav aria-label="Breadcrumb" className="eyebrow text-muted flex gap-2 py-6">
          <Link href="/" className="hover:text-ink">Home</Link>
          <span aria-hidden>/</span>
          <span className="text-ink">New arrivals</span>
        </nav>
      </div>

      <section className="container-site pb-section lg:pb-section-lg">
        <header className="mb-8 border-b border-line pb-8 lg:mb-12 lg:pb-12">
          <p className="eyebrow text-muted mb-2">Just in</p>
          <h1 className="heading-display">New arrivals</h1>
          <p className="text-muted mt-4 max-w-md text-small">
            The latest pieces to join the house, newest first.
          </p>
        </header>

        {products.length > 0 ? (
          <>
            <p className="eyebrow text-muted mb-6">
              {products.length} {products.length === 1 ? "piece" : "pieces"}
            </p>
            <div className="product-grid">
              {products.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
          </>
        ) : (
          <div className="panel py-section text-center">
            <p className="text-muted text-small">
              Nothing new right now. Please check back soon.
            </p>
            <Link href="/" className="btn btn-outline mt-6">
              Back to home
            </Link>
          </div>
        )}
      </section>
    </>
  );
}
