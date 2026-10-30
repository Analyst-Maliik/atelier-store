import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getProductBySlug,
  getProductSlugs,
  getRelatedProducts,
} from "@/db/queries/catalog";
import { SectionHeading } from "@/components/layout/section-heading";
import { ProductCard } from "@/components/product/product-card";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductInfo } from "@/components/product/product-info";

export async function generateStaticParams() {
  const slugs = await getProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/products/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  return {
    title: `${product.name} | Atelier Store`,
    description: product.description,
  };
}

export default async function ProductPage({ params }: PageProps<"/products/[slug]">) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product.slug, product.category.slug);

  return (
    <>
      <div className="container-site">
        <nav aria-label="Breadcrumb" className="eyebrow text-muted flex gap-2 py-6">
          <Link href="/" className="hover:text-ink">Home</Link>
          <span aria-hidden>/</span>
          <span className="text-ink">{product.name}</span>
        </nav>

        <div className="grid gap-10 pb-section lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:gap-16 lg:pb-section-lg">
          <ProductGallery product={product} />
          <div className="lg:sticky lg:top-28 lg:self-start">
            <ProductInfo product={product} />
          </div>
        </div>
      </div>

      <section className="container-site border-t border-line pb-section pt-section lg:pb-section-lg lg:pt-section-lg">
        <SectionHeading eyebrow="Discover more" title="You may also like" />
        <div className="product-grid">
          {related.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </section>
    </>
  );
}
