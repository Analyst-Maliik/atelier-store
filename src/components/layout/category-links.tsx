import Link from "next/link";
import { getCategories } from "@/db/queries/catalog";

/** "Browse by category" row, shared by the search and cart empty states. */
export async function CategoryLinks({ className }: { className?: string }) {
  const categories = await getCategories();
  return (
    <nav aria-label="Browse by category" className={className}>
      {categories.map((c) => (
        <Link key={c.slug} href={`/collections/${c.slug}`} className="eyebrow link">
          {c.name}
        </Link>
      ))}
    </nav>
  );
}
