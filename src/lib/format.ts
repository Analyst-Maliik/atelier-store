const orderDate = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

/** Calendar date for order screens. Fixed to UTC so server and browser always agree. */
export const formatOrderDate = (date: Date) => orderDate.format(date);

/** Formats a price stored in minor units (cents) as USD. */
export const formatPrice = (cents: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(cents / 100);
