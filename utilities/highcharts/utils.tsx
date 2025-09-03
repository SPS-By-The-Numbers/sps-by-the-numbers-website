export const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: 'compact',
  compactDisplay: 'short',
  maximumFractionDigits: 0,
}).format;
