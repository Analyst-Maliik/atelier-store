"use client";

import { useActionState } from "react";
import {
  subscribeToNewsletter,
  type NewsletterState,
} from "@/app/actions/newsletter";

const initialState: NewsletterState = { status: "idle", message: "" };

export function NewsletterForm() {
  const [state, formAction, pending] = useActionState(
    subscribeToNewsletter,
    initialState,
  );

  return (
    // POST only: a GET form would put the address in the URL and history.
    <form action={formAction} method="POST" className="relative w-full max-w-md" noValidate>
      <label htmlFor="newsletter-email" className="eyebrow mb-3 block">
        Newsletter
      </label>
      <div className="flex items-end gap-4">
        <input
          id="newsletter-email"
          name="email"
          type="email"
          required
          maxLength={254}
          autoComplete="email"
          placeholder="Email address"
          aria-describedby="newsletter-status"
          aria-invalid={state.status === "error"}
          className="field"
        />
        <button type="submit" className="btn btn-primary shrink-0" disabled={pending}>
          {pending ? "Sending" : "Subscribe"}
        </button>
      </div>

      {/* Honeypot, hidden from people and assistive tech. */}
      <input
        name="company"
        type="text"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        className="absolute -left-[9999px] h-0 w-0 opacity-0"
      />

      <p
        id="newsletter-status"
        role="status"
        className={`mt-3 min-h-5 text-small ${
          state.status === "error" ? "text-accent" : "text-muted"
        }`}
      >
        {state.message}
      </p>
    </form>
  );
}
