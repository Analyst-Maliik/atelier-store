export type StockState = "in-stock" | "low-stock" | "out-of-stock";

export const LOW_STOCK_THRESHOLD = 5;

export function getStockState(stock: number): StockState {
  if (stock <= 0) return "out-of-stock";
  return stock <= LOW_STOCK_THRESHOLD ? "low-stock" : "in-stock";
}
