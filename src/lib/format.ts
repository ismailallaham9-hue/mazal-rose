/** Format an integer AED amount as a clean price string, e.g. "AED 1,250". */
export function formatAED(amount: number): string {
  return `AED ${amount.toLocaleString("en-AE")}`;
}
