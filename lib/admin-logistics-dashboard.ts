import type { AdminDonationRow } from "@/hooks/useAdminDonations";
import { isDonationPaymentCompletedValue } from "@/lib/donation-payment-status";
import { todayDateIsrael } from "@/lib/admin-today-israel";
import {
  orderMatchesPipelineTab,
  type AdminDonationRowForPipeline,
  type AdminOrderPipelineTab,
} from "@/lib/donation-funnel-stage";

export type LogisticsDonationTabId = "potential" | "orders" | "today" | "letters" | "archive" | "customers";

export function donationRowForPipelineTab(r: AdminDonationRow): AdminDonationRowForPipeline {
  return {
    funnel_stage: r.funnel_stage,
    payment_status: r.payment_status,
    portal_fulfillment_stage: r.portal_fulfillment_stage,
    pickup_status: r.pickup_status,
    delivery_status: r.delivery_status,
    letter_status: r.letter_status,
  };
}

export function filterDonationsByOrderPipeline(rows: AdminDonationRow[], pipeline: AdminOrderPipelineTab): AdminDonationRow[] {
  return rows.filter((r) => orderMatchesPipelineTab(donationRowForPipelineTab(r), pipeline));
}

function isDonationPaymentCompleted(r: AdminDonationRow): boolean {
  return isDonationPaymentCompletedValue(r.payment_status as string | null | undefined | boolean);
}

/**
 * לשונית «לקוחות פוטנציאליים»: עדיין בלי תשלום שהושלם (טיוטת משפך או נרשמו לפני סליקה).
 * «ממתין לתשלום» מופיע כאן, לא ב«כל ההזמנות».
 */
export function isPotentialCustomersTabRow(r: AdminDonationRow): boolean {
  return !isDonationPaymentCompleted(r);
}

/** לשוניות הזמנות רשמיות / לוגיסטיקה: רק שורות עם תשלום שהושלם */
export function excludeUnpaidDonations(rows: AdminDonationRow[]): AdminDonationRow[] {
  return rows.filter(isDonationPaymentCompleted);
}

/** @deprecated השם היסטורי — מסנן לפי תשלום שהושלם (לא לפי משפך בלבד) */
export function excludeFunnelPotentialRows(rows: AdminDonationRow[]): AdminDonationRow[] {
  return excludeUnpaidDonations(rows);
}

export type DonationMultiFilterState = {
  cities: string[];
  pickupStatuses: string[];
  letterStatuses: string[];
  deliveryStatuses: string[];
};

export const PICKUP_FILTER_OPTIONS = ["pending", "picked_up", "failed"] as const;
export const LETTER_FILTER_OPTIONS = ["pending", "generated", "sent", "completed", "failed"] as const;
export const DELIVERY_FILTER_OPTIONS = ["at_warehouse", "sent_to_ngo", "delivered"] as const;

export function filterDonationsBySearch(rows: AdminDonationRow[], q: string): AdminDonationRow[] {
  const raw = q.trim();
  if (!raw) return rows;
  const digitsOnly = raw.replace(/^#/, "").replace(/\s+/g, "");
  if (/^\d+$/.test(digitsOnly)) {
    const n = Number(digitsOnly);
    const exact = rows.filter((r) => r.order_number === n);
    if (exact.length > 0) return exact;
  }
  const s = raw.toLowerCase();
  return rows.filter((r) => {
    const hay = [
      r.order_number != null ? String(r.order_number) : "",
      r.id,
      r.child_name,
      r.first_name,
      r.last_name,
      r.phone,
      r.email,
      r.pickup_city,
      r.address,
      r.pickup_address,
      r.street_name,
      r.house_number,
      r.apartment_number,
      r.address_notes,
      r.pickup_notes,
      r.target_ngo_name,
      r.funnel_stage,
      r.portal_fulfillment_stage,
    ]
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

/** מכתבים: שולם, פריטים אצל העמותה, מכתב עדיין לא נסגר (לא נשלח / לא הושלם) */
export function isLettersTabRow(r: AdminDonationRow): boolean {
  const paid = isDonationPaymentCompleted(r);
  const ds = r.delivery_status ?? "";
  const ls = r.letter_status ?? "pending";
  return paid && ds === "delivered" && ls !== "sent" && ls !== "completed";
}

/** ארכיון: פריטים אצל העמותה + מכתב נשלח/הושלם */
export function isArchiveCompletedRow(r: AdminDonationRow): boolean {
  const ls = r.letter_status ?? "";
  const letterDone = ls === "sent" || ls === "completed";
  return (r.pickup_status ?? "") === "picked_up" && (r.delivery_status ?? "") === "delivered" && letterDone;
}

export function filterRowsByLogisticsTab(rows: AdminDonationRow[], tab: LogisticsDonationTabId): AdminDonationRow[] {
  if (tab === "potential") return rows.filter(isPotentialCustomersTabRow);
  const paidOnly = excludeUnpaidDonations(rows);
  if (tab === "orders") return paidOnly;
  if (tab === "today") return paidOnly.filter(isTodayShipmentRow);
  if (tab === "letters") return paidOnly.filter(isLettersTabRow);
  if (tab === "archive") return paidOnly.filter(isArchiveCompletedRow);
  return paidOnly;
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
  if (f.deliveryStatuses.length > 0) {
    const ds = new Set(f.deliveryStatuses);
    out = out.filter((r) => ds.has(r.delivery_status ?? ""));
  }
  return out;
}
