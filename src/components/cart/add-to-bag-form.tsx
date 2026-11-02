"use client";

import Link from "next/link";
import { useActionState } from "react";
import { addToCart, type CartActionState } from "@/app/actions/cart";

const initialState: CartActionState = { status: "idle", message: "" };

/** The page can show stock up to a minute old; the action re-checks it live. */
export function AddToBagForm({ slug, soldOut }: { slug: string; soldOut: boolean }) {
  const [state, formAction, pending] = useActionState(addToCart, initialState);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="slug" value={slug} />
      <button
        type="submit"
        className="btn btn-primary btn-block"
        disabled={soldOut || pending}
        aria-busy={pending}
      >
        {soldOut ? "Sold out" : pending ? "Adding…" : "Add to bag"}
      </button>
      <p
        role="status"
        className={`min-h-5 text-center text-small ${
          state.status === "error" ? "text-accent" : "text-muted"
        }`}
      >
        {state.message}
        {state.status === "success" && (
          <>
            {" "}
            <Link href="/cart" className="link text-ink">
              View bag
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
