"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const INTERVAL_MS = 2500;
const MAX_ATTEMPTS = 12;

/** Re-fetches the page until the webhook has confirmed the payment, then gives up politely. */
export function AutoRefresh() {
  const router = useRouter();
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setAttempts((n) => n + 1);
      router.refresh();
    }, INTERVAL_MS);
    return () => clearInterval(timer);
  }, [router]);

  useEffect(() => {
    if (attempts >= MAX_ATTEMPTS) router.refresh();
  }, [attempts, router]);

  return attempts >= MAX_ATTEMPTS ? (
    <p className="text-muted mt-4 max-w-md text-small">
      This is taking longer than usual. Your order will update here once the payment is
      confirmed. Please do not pay again.
    </p>
  ) : null;
}
