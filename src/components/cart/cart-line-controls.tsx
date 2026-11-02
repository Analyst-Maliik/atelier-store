"use client";

import { useFormStatus } from "react-dom";
import { removeFromCart, setQuantity } from "@/app/actions/cart";

type Props = {
  slug: string;
  name: string;
  quantity: number;
  /** Highest quantity the bag may hold (stock and per-line cap). */
  max: number;
  /** Why the + button is disabled, shown next to it. */
  maxLabel: string;
  soldOut: boolean;
};

const stepButton =
  "flex h-10 w-10 items-center justify-center border border-line text-lg leading-none hover:border-ink disabled:cursor-not-allowed disabled:text-ink-subtle disabled:hover:border-line";

/** Submit button that marks itself busy while its form's action runs. */
function ActionButton({
  label,
  className,
  disabled,
  children,
}: {
  label: string;
  className: string;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className={className}
      aria-label={label}
      aria-busy={pending || undefined}
      disabled={disabled || pending}
    >
      {children}
    </button>
  );
}

function Step({
  slug,
  quantity,
  label,
  disabled,
  children,
}: {
  slug: string;
  quantity: number;
  label: string;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <form action={setQuantity}>
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="quantity" value={quantity} />
      <ActionButton label={label} className={stepButton} disabled={disabled}>
        {children}
      </ActionButton>
    </form>
  );
}

/**
 * Quantity stepper and Remove. These are plain forms, so they work without JS; the
 * client part only adds the busy state (the row dims via the parent's `has-[]` rule).
 */
export function CartLineControls({ slug, name, quantity, max, maxLabel, soldOut }: Props) {
  const atMax = quantity >= max;

  return (
    <div className="mt-auto flex flex-wrap items-center justify-between gap-4">
      {soldOut ? (
        <span className="eyebrow text-muted">Sold out</span>
      ) : (
        <div className="flex items-center gap-3">
          <Step
            slug={slug}
            quantity={quantity - 1}
            label={quantity === 1 ? `Remove ${name} from bag` : `Decrease quantity of ${name}`}
          >
            &minus;
          </Step>
          <span className="min-w-6 text-center" aria-label={`Quantity ${quantity}`}>
            {quantity}
          </span>
          <Step
            slug={slug}
            quantity={quantity + 1}
            label={atMax ? `${maxLabel}: cannot add more ${name}` : `Increase quantity of ${name}`}
            disabled={atMax}
          >
            +
          </Step>
          {atMax && <span className="text-muted text-small">{maxLabel}</span>}
        </div>
      )}

      <form action={removeFromCart}>
        <input type="hidden" name="slug" value={slug} />
        <ActionButton
          label={`Remove ${name} from bag`}
          className="eyebrow link text-muted hover:text-ink disabled:no-underline"
        >
          Remove
        </ActionButton>
      </form>
    </div>
  );
}
