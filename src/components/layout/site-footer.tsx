import Link from "next/link";
import { NewsletterForm } from "./newsletter-form";

const columns = [
  {
    title: "Client Care",
    links: ["Contact us", "Shipping", "Returns", "Size guide"],
  },
  {
    title: "The House",
    links: ["Our story", "Craftsmanship", "Sustainability", "Careers"],
  },
  {
    title: "Shop",
    links: ["Women", "Men", "Knitwear", "Outerwear"],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-line">
      <div className="container-site grid gap-6 border-b border-line py-section md:grid-cols-2 md:items-end">
        <div>
          <h2 className="heading-title">Stay in touch</h2>
          <p className="text-muted mt-3 max-w-sm text-small">
            New arrivals and private previews, sent occasionally. Unsubscribe at any time.
          </p>
        </div>
        <NewsletterForm />
      </div>

      <div className="container-site section grid gap-12 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="max-w-xs">
          <p className="text-lg tracking-wide-label uppercase">Atelier</p>
          <p className="text-muted mt-4 text-small">
            Considered pieces, made to be kept. Free shipping and returns on every order.
          </p>
        </div>

        {columns.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <h2 className="eyebrow mb-5">{col.title}</h2>
            <ul className="space-y-3 text-small">
              {col.links.map((label) => (
                <li key={label}>
                  <Link href="#" className="text-muted hover:text-ink">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="border-t border-line">
        <p className="eyebrow container-site text-muted py-6">
          &copy; Atelier Store. Sample storefront.
        </p>
      </div>
    </footer>
  );
}
