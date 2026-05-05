import type { AdminDonationRow } from "@/hooks/useAdminDonations";
import { todayDateIsrael } from "@/lib/admin-today-israel";

export type LogisticsDonationTabId = "all" | "today" | "letters" | "archive";

export type DonationMultiFilterState = {
  cities: string[];
  pickupStatuses: string[];
  letterStatuses: string[];
};

export const PICKUP_FILTER_OPTIONS = ["pending", "picked_up", "failed"] as const;
export const LETTER_FILTER_OPTIONS = ["pending", "generated", "sent", "completed", "failed"] as const;

export function filterDonationsBySearch(rows: AdminDonationRow[], q: string): AdminDonationRow[] {
  const s = q.trim().toLowerCase();
  if (!s) return rows;
  return rows.filter((r) => {
    const hay = [r.child_name, r.first_name, r.last_name, r.phone, r.email, r.pickup_city, r.address, r.pickup_address, r.target_ngo_name]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return hay.includes(s);
  });
}

export function extractCityKey(r: AdminDonationRow): string {
  const c = r.pickup_city?.trim();
  if (c) return c;
  const addr = (r.pickup_address ?? r.address ?? "").trim();
  if (!addr) return "ללא עיר";
  const parts = addr.split(",").map((x) => x.trim()).filter(Boolean);
  if (parts.length >= 2) return parts[parts.length - 1] ?? "ללא עיר";
  return addr.length > 28 ? `${addr.slice(0, 28)}…` : addr;
}

export function uniqueCitiesFromRows(rows: AdminDonationRow[]): string[] {
  const set = new Set(rows.map(extractCityKey));
  return [...set].sort((a, b) => a.localeCompare(b, "he"));
}

export function isTodayShipmentRow(r: AdminDonationRow): boolean {
  const today = todayDateIsrael();
  return (r.pickup_date ?? "") === today && (r.pickup_status ?? "pending") !== "failed";
}

/** מכתבים: הגיע לעמותה + מכתב עדיין בתור */
export function isLettersTabRow(r: AdminDonationRow): boolean {
  const ds = r.delivery_status ?? "";
  const ls = r.letter_status ?? "pending";
  return ds === "delivered" && ls !== "completed" && ls !== "failed";
}

/** ארכיון: פריטים אצל העמותה + מכתב נשלח/הושלם */
export function isArchiveCompletedRow(r: AdminDonationRow): boolean {
  const ls = r.letter_status ?? "";
  const letterDone = ls === "sent" || ls === "completed";
  return (r.pickup_status ?? "") === "picked_up" && (r.delivery_status ?? "") === "delivered" && letterDone;
}

export function filterRowsByLogisticsTab(rows: AdminDonationRow[], tab: LogisticsDonationTabId): AdminDonationRow[] {
  if (tab === "all") return rows;
  if (tab === "today") return rows.filter(isTodayShipmentRow);
  if (tab === "letters") return rows.filter(isLettersTabRow);
  return rows.filter(isArchiveCompletedRow);
}

export function applyDonationMultiFilters(rows: AdminDonationRow[], f: DonationMultiFilterState): AdminDonationRow[] {
  let out = rows;
  if (f.cities.length > 0) {
    const set = new Set(f.cities);
    out = out.filter((r) => set.has(extractCityKey(r)));
  }
  if (f.pickupStatuses.length > 0) {
    const ps = new Set(f.pickupStatuses);
    out = out.filter((r) => ps.has(r.pickup_status ?? "pending"));
  }
  if (f.letterStatuses.length > 0) {
    const ls = new Set(f.letterStatuses);
    out = out.filter((r) => ls.has(r.letter_status ?? "pending"));
  }
  return out;
}
