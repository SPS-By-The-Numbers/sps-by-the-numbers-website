export function makeCurrencyFormatter(precision : number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: precision,
  }).format;
}
