import Image from "next/image";
import Link from "next/link";
import { collections } from "@/lib/site-content";
import { SectionHeading } from "@/components/layout/section-heading";

export function CollectionGrid() {
  return (
    <section className="container-site section">
      <SectionHeading eyebrow="Explore" title="Featured collections" />
      <ul className="grid grid-cols-2 gap-x-2 gap-y-8 md:gap-x-4 lg:grid-cols-4">
        {collections.map((c) => (
          <li key={c.slug}>
            <Link href={`/collections/${c.slug}`} className="product-card">
              <div className="product-card__media aspect-[3/4]">
                <Image
                  src={c.image}
                  alt={c.alt}
                  width={720}
                  height={960}
                  sizes="(min-width: 1024px) 25vw, 50vw"
                />
              </div>
              <span className="eyebrow">{c.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
