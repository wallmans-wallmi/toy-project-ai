/** תצוגת מספר הזמנה (למשל #1001) */
export function formatHebrewOrderNumberLabel(orderNumber: number | null | undefined): string {
  if (orderNumber == null || !Number.isFinite(orderNumber)) return "—";
  return `#${Math.trunc(orderNumber)}`;
}

/** גיבוי תצוגה כשאין עדיין order_number במסד (לפני מיגרציה) */
export function adminDonationOrderNumberFallbackFromId(id: string): string {
  const compact = id.replace(/-/g, "");
  return compact.slice(0, 8).toUpperCase();
}
