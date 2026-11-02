import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { searchProducts } from "@/db/queries/catalog";
import { CategoryLinks } from "@/components/layout/category-links";
import { ProductCard } from "@/components/product/product-card";
import { MAX_QUERY_LENGTH, normalizeQuery } from "@/lib/search";

export const metadata: Metadata = {
  title: "Search | Atelier Store",
  description: "Search the Atelier collection.",
  robots: { index: false },
};

/** Reads the query string, so it renders inside <Suspense>. */
async function SearchResults({ searchParams }: { searchParams: PageProps<"/search">["searchParams"] }) {
  const { q: rawQuery } = await searchParams;
  const query = normalizeQuery(rawQuery);

  return (
    <>
      {/* A plain GET form: works without JS, and the query is safe to show in the URL. */}
      <form action="/search" role="search" className="mb-10 flex items-end gap-4 lg:mb-12">
        <div className="flex-1">
          <label htmlFor="search-q" className="eyebrow mb-3 block">
            Search
          </label>
          <input
            id="search-q"
            name="q"
            type="search"
            defaultValue={query}
            maxLength={MAX_QUERY_LENGTH}
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            placeholder="Dresses, watches, knitwear"
            className="field"
          />
        </div>
        <button type="submit" className="btn btn-primary shrink-0">
          Search
        </button>
      </form>

      {query ? <Results query={query} /> : <Browse />}
    </>
  );
}

async function Results({ query }: { query: string }) {
  const products = await searchProducts(query);

  if (products.length === 0) {
    return (
      <div className="panel py-section text-center">
        <p className="heading-title">No results</p>
        <p className="text-muted mx-auto mt-3 max-w-sm text-small">
          Nothing matched &ldquo;{query}&rdquo;. Check the spelling, try fewer words, or browse a
          category.
        </p>
        <Suspense>
          <CategoryLinks className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-3" />
        </Suspense>
      </div>
    );
  }

  return (
    <>
      <p className="eyebrow text-muted mb-6" role="status">
        {products.length} {products.length === 1 ? "result" : "results"} for &ldquo;{query}&rdquo;
      </p>
      <div className="product-grid">
        {products.map((p) => (
          <ProductCard key={p.slug} product={p} />
        ))}
      </div>
    </>
  );
}

function Browse() {
  return (
    <div>
      <p className="eyebrow text-muted mb-4">Browse by category</p>
      <Suspense>
        <CategoryLinks className="flex flex-wrap gap-x-6 gap-y-3" />
      </Suspense>
    </div>
  );
}

export default function SearchPage({ searchParams }: PageProps<"/search">) {
  return (
    <>
      <div className="container-site">
        <nav aria-label="Breadcrumb" className="eyebrow text-muted flex gap-2 py-6">
          <Link href="/" className="hover:text-ink">Home</Link>
          <span aria-hidden>/</span>
          <span className="text-ink">Search</span>
        </nav>
      </div>

      <section className="container-site pb-section lg:pb-section-lg">
        <header className="mb-8 lg:mb-12">
          <h1 className="heading-display">Search</h1>
        </header>
        <Suspense>
          <SearchResults searchParams={searchParams} />
        </Suspense>
      </section>
    </>
  );
}
