import { getStockState, type StockState } from "@/lib/stock";

const copy: Record<StockState, (stock: number) => string> = {
  "in-stock": () => "In stock",
  "low-stock": (stock) => `Only ${stock} left`,
  "out-of-stock": () => "Sold out",
};

const dot: Record<StockState, string> = {
  "in-stock": "bg-ink",
  "low-stock": "bg-accent",
  "out-of-stock": "bg-ink-subtle",
};

export function StockStatus({ stock }: { stock: number }) {
  const state = getStockState(stock);
  return (
    <p className="eyebrow flex items-center gap-2" role="status">
      <span aria-hidden className={`size-2 rounded-pill ${dot[state]}`} />
      <span className={state === "low-stock" ? "text-accent" : undefined}>
        {copy[state](stock)}
      </span>
    </p>
  );
}
