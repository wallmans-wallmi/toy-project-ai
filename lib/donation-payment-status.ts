/**
 * זיהוי תשלום שהושלם: טקסט `completed`, או עמודת boolean ישנה (`true`).
 */
export function isDonationPaymentCompletedValue(p: string | null | undefined | boolean): boolean {
  if (p === true) return true;
  if (p === false || p == null) return false;
  const s = String(p).trim().toLowerCase();
  return s === "completed" || s === "true";
}
