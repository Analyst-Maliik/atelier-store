import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getCategories,
  getCategoryBySlug,
  getCategorySlugs,
  getProductsByCategory,
} from "@/db/queries/catalog";
import { ProductCard } from "@/components/product/product-card";

export async function generateStaticParams() {
  const slugs = await getCategorySlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/collections/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return {};
  return {
    title: `${category.name} | Atelier Store`,
    description: `Shop ${category.name.toLowerCase()} from the Atelier collection.`,
  };
}

export default async function CollectionPage({ params }: PageProps<"/collections/[slug]">) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const [products, categories] = await Promise.all([
    getProductsByCategory(category.slug),
    getCategories(),
  ]);

  return (
    <>
      <div className="container-site">
        <nav aria-label="Breadcrumb" className="eyebrow text-muted flex gap-2 py-6">
          <Link href="/" className="hover:text-ink">Home</Link>
          <span aria-hidden>/</span>
          <span className="text-ink">{category.name}</span>
        </nav>
      </div>

      <section className="container-site pb-section lg:pb-section-lg">
        <header className="mb-8 border-b border-line pb-8 lg:mb-12 lg:pb-12">
          <p className="eyebrow text-muted mb-2">Collection</p>
          <h1 className="heading-display">{category.name}</h1>
          <nav aria-label="Categories" className="mt-6 flex flex-wrap gap-x-6 gap-y-3">
            {categories.map((c) => (
              <Link
                key={c.slug}
                href={`/collections/${c.slug}`}
                aria-current={c.slug === category.slug ? "page" : undefined}
                className={`eyebrow ${c.slug === category.slug ? "text-ink" : "text-muted hover:text-ink"}`}
              >
                {c.name}
              </Link>
            ))}
          </nav>
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
              Nothing in {category.name.toLowerCase()} right now. Please check back soon.
            </p>
            <Link href="/new-arrivals" className="btn btn-outline mt-6">
              See new arrivals
            </Link>
          </div>
        )}
      </section>
    </>
  );
}
