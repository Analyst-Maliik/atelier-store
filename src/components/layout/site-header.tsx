import Link from "next/link";

const nav = [
  { label: "New", href: "/new-arrivals" },
  { label: "Women", href: "/collections/women" },
  { label: "Men", href: "/collections/men" },
  { label: "Knitwear", href: "/collections/knitwear" },
  { label: "Outerwear", href: "/collections/outerwear" },
  { label: "Accessories", href: "/collections/accessories" },
];

export function SiteHeader() {
  return (
    <>
      <div className="bg-ink text-canvas">
        <p className="eyebrow container-site py-2.5 text-center">
          Complimentary shipping on orders over $250
        </p>
      </div>

      <header className="sticky top-0 z-40 border-b border-line bg-canvas">
        <div className="container-site relative grid h-header grid-cols-[1fr_auto_1fr] items-center lg:h-header-lg">
          {/* Mobile menu (no JS needed) */}
          <details className="group lg:hidden">
            <summary className="eyebrow cursor-pointer list-none py-3">
              <span className="group-open:hidden">Menu</span>
              <span className="hidden group-open:inline">Close</span>
            </summary>
            <nav
              aria-label="Primary"
              className="absolute inset-x-0 top-full border-b border-line bg-canvas"
            >
              <ul className="container-site flex flex-col py-4">
                {nav.map((item) => (
                  <li key={item.href} className="border-b border-line last:border-0">
                    <Link href={item.href} className="eyebrow block py-4">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </details>

          <nav aria-label="Primary" className="hidden gap-8 lg:flex">
            {nav.map((item) => (
              <Link key={item.href} href={item.href} className="nav-link">
                {item.label}
              </Link>
            ))}
          </nav>

          <Link
            href="/"
            className="text-center text-lg tracking-wide-label uppercase sm:text-xl"
          >
            Atelier
          </Link>

          <div className="flex items-center justify-end gap-5 sm:gap-8">
            <Link href="/search" className="nav-link hidden sm:inline">
              Search
            </Link>
            <Link href="/account" className="nav-link hidden sm:inline">
              Account
            </Link>
            <Link href="/cart" className="nav-link">
              Bag (0)
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}
