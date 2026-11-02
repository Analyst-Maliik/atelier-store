"use client";

import { useFormStatus } from "react-dom";

/** Submit button for the checkout form: busy state prevents double submits. */
export function CheckoutButton({ disabled }: { disabled?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className="btn btn-primary btn-block"
      disabled={disabled || pending}
      aria-busy={pending || undefined}
    >
      {pending ? "Redirecting to payment…" : "Checkout"}
    </button>
  );
}
