import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { CartLineItem } from "@/components/cart/cart-line";
import { CartSummary } from "@/components/cart/cart-summary";
import { CategoryLinks } from "@/components/layout/category-links";
import { getCart } from "@/lib/cart-server";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = {
  title: "Bag | Atelier Store",
  robots: { index: false },
};

// Keys come from the `?checkout=` flag set by startCheckout and by Stripe's cancel URL.
// Problems are announced as alerts; walking away from payment is only a calm status note.
const checkoutMessages: Record<string, { tone: "alert" | "info"; text: string }> = {
  cancelled: {
    tone: "info",
    text: "Checkout cancelled. You have not been charged, and your bag is saved.",
  },
  changed: {
    tone: "alert",
    text: "Some items changed while you were checking out. Please review your bag, then try again.",
  },
  error: { tone: "alert", text: "We could not start checkout. Please try again in a moment." },
  busy: { tone: "alert", text: "Too many attempts. Please wait a moment and try again." },
};

/** Keeps the layout steady while the bag loads, so nothing jumps when it appears. */
function CartSkeleton() {
  return (
    <div
      className="grid gap-10 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:gap-16"
      aria-busy="true"
      aria-label="Loading your bag"
    >
      <div className="border-t border-line">
        {[0, 1].map((n) => (
          <div key={n} className="grid grid-cols-[6rem_minmax(0,1fr)] gap-5 border-b border-line py-6 sm:grid-cols-[8rem_minmax(0,1fr)] sm:gap-8">
            <div className="aspect-[4/5] animate-pulse bg-surface" />
            <div className="space-y-3">
              <div className="h-3 w-1/4 animate-pulse bg-surface" />
              <div className="h-4 w-2/3 animate-pulse bg-surface" />
              <div className="h-4 w-1/3 animate-pulse bg-surface" />
            </div>
          </div>
        ))}
      </div>
      <div className="panel h-64 animate-pulse" />
    </div>
  );
}

/** Reads the cookie and live product data, so it renders inside <Suspense>. */
async function CartContents({ searchParams }: { searchParams: PageProps<"/cart">["searchParams"] }) {
  const { checkout } = await searchParams;
  const checkoutMessage = typeof checkout === "string" ? checkoutMessages[checkout] : undefined;
  const cart = await getCart();

  if (cart.lines.length === 0) {
    return (
      <div className="panel py-section text-center">
        <p className="heading-title">Your bag is empty</p>
        <p className="text-muted mx-auto mt-3 max-w-sm text-small">
          Find something you love and it will wait for you here.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link href="/new-arrivals" className="btn btn-primary">
            New arrivals
          </Link>
          <Link href="/search" className="btn btn-outline">
            Search
          </Link>
        </div>
        <CategoryLinks className="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-3" />
      </div>
    );
  }

  const unavailable = cart.lines.filter((l) => l.status === "sold-out").length;
  const changed = cart.lines.some((l) => l.status !== "ok");

  return (
    <>
      {checkoutMessage &&
        (checkoutMessage.tone === "alert" ? (
          <p role="alert" className="mb-8 border border-accent px-4 py-3 text-small text-accent">
            {checkoutMessage.text}
          </p>
        ) : (
          <p role="status" className="mb-8 border border-line px-4 py-3 text-small text-muted">
            {checkoutMessage.text}
          </p>
        ))}

      {/* Announces quantity and subtotal changes to screen readers after each action. */}
      <p className="sr-only" role="status" aria-live="polite">
        Your bag has {cart.itemCount} {cart.itemCount === 1 ? "item" : "items"}. Subtotal{" "}
        {formatPrice(cart.subtotalCents)}.
      </p>

      {changed && (
        <p role="status" className="mb-8 border border-accent px-4 py-3 text-small text-accent">
          Availability changed for some items in your bag. We have updated the quantities and
          totals below.
        </p>
      )}

      <p className="eyebrow text-muted mb-6">
        {cart.itemCount} {cart.itemCount === 1 ? "item" : "items"}
      </p>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:gap-16">
        <ul className="border-t border-line">
          {cart.lines.map((line) => (
            <CartLineItem key={line.product.slug} line={line} />
          ))}
        </ul>
        <CartSummary
          itemCount={cart.itemCount}
          subtotalCents={cart.subtotalCents}
          unavailableCount={unavailable}
        />
      </div>
    </>
  );
}

export default function CartPage({ searchParams }: PageProps<"/cart">) {
  return (
    <>
      <div className="container-site">
        <nav aria-label="Breadcrumb" className="eyebrow text-muted flex gap-2 py-6">
          <Link href="/" className="hover:text-ink">Home</Link>
          <span aria-hidden>/</span>
          <span className="text-ink">Bag</span>
        </nav>
      </div>

      <section className="container-site pb-section lg:pb-section-lg">
        <h1 className="heading-display mb-8 lg:mb-12">Your bag</h1>
        <Suspense fallback={<CartSkeleton />}>
          <CartContents searchParams={searchParams} />
        </Suspense>
      </section>
    </>
  );
}
