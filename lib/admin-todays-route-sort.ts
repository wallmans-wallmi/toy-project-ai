import type { AdminDonationRow } from "@/hooks/useAdminDonations";

function pickupTimeMinutes(t: string | null | undefined): number {
  if (!t || t.length < 4) return 24 * 60 + 999;
  const [h, m] = t.slice(0, 5).split(":").map((x) => parseInt(x, 10));
  const hh = Number.isFinite(h) ? h : 0;
  const mm = Number.isFinite(m) ? m : 0;
  return hh * 60 + mm;
}

/** מיון לפי שעת איסוף — מהמוקדם למאוחר */
export function sortDonationsByPickupTime(rows: AdminDonationRow[]): AdminDonationRow[] {
  return [...rows].sort((a, b) => pickupTimeMinutes(a.pickup_time) - pickupTimeMinutes(b.pickup_time));
}
