import type { AdminDonationPatch, AdminDonationRow } from "@/hooks/useAdminDonations";
import { isDonationPaymentCompletedValue } from "@/lib/donation-payment-status";
import type { AdminDashboardRole } from "@/lib/admin-role-types";
import { isLettersTabRow } from "@/lib/admin-logistics-dashboard";
import { FUNNEL_POTENTIAL } from "@/lib/donation-funnel-stage";
import { ADMIN_ORDER_LIFECYCLE_LABELS_HE } from "@/lib/admin-order-lifecycle-preset-patch";

/** ערכי הדרופדאון לעדכון ידני (משרד/אדמין) — `mark_paid` רק לאדמין */
export type AdminManualOrderStatusValue =
  | ""
  | "mark_paid"
  | "kit_received"
  | "shipment_collected"
  | "shipment_donated"
  | "letter_sent";

export const ADMIN_MANUAL_ORDER_STATUS_OPTIONS: { value: Exclude<AdminManualOrderStatusValue, "" | "mark_paid">; label: string }[] = [
  { value: "kit_received", label: "ערכה התקבלה" },
  { value: "shipment_collected", label: "משלוח נאסף" },
  { value: "shipment_donated", label: "משלוח נתרם" },
  { value: "letter_sent", label: "מכתב נשלח" },
];

function isPotential(r: AdminDonationRow): boolean {
  return (r.funnel_stage ?? "").trim() === FUNNEL_POTENTIAL;
}

function paidCompleted(r: AdminDonationRow): boolean {
  return isDonationPaymentCompletedValue(r.payment_status as string | null | undefined | boolean);
}

/**
 * סטטוס תצוגה לטבלת הזמנות (טריגרים: תשלום, תיאום איסוף בפורטל, עדכונים ידניים באדמין).
 */
export function adminOrderLifecycleStatusHe(r: AdminDonationRow): string {
  if (isPotential(r)) return "טיוטה";
  if (!paidCompleted(r)) return "ממתין לתשלום";

  const ls = (r.letter_status ?? "").trim();
  if (ls === "completed") return "מכתב התקבל";
  if (ls === "sent") return "מכתב נשלח";

  if (isLettersTabRow(r)) return "ממתין למכתב";

  const ds = (r.delivery_status ?? "").trim();
  if (ds === "delivered") return "נתרם";

  const ps = (r.pickup_status ?? "").trim();
  if (ps === "picked_up") return "נאסף";

  const portal = (r.portal_fulfillment_stage ?? "").trim();
  if (portal === "pickup_scheduled" || portal === "courier_en_route") return "תואם איסוף";

  if (portal === "kit_delivered" && ps === "pending") return "ערכה התקבלה";

  if (portal === "request_received" || portal === "kit_in_transit") return "ממתין לערכה";

  return "ממתין לערכה";
}

const STATUS_BADGE_BASE =
  "inline-flex max-w-full items-center rounded-full px-2.5 py-1 text-[10px] font-bold leading-tight";

/** מחלקות טיילווינד ללייבל סטטוס (צבע לפי שלב לוגי) */
export function adminOrderLifecycleStatusBadgeClass(labelHe: string): string {
  switch (labelHe) {
    case "טיוטה":
      return `${STATUS_BADGE_BASE} bg-slate-100 text-slate-700`;
    case "ממתין לתשלום":
      return `${STATUS_BADGE_BASE} bg-amber-100 text-amber-900`;
    case "ממתין לערכה":
      return `${STATUS_BADGE_BASE} bg-sky-100 text-sky-900`;
    case "ערכה התקבלה":
      return `${STATUS_BADGE_BASE} bg-violet-100 text-violet-900`;
    case "תואם איסוף":
      return `${STATUS_BADGE_BASE} bg-indigo-100 text-indigo-900`;
    case "נאסף":
      return `${STATUS_BADGE_BASE} bg-blue-100 text-blue-900`;
    case "נתרם":
      return `${STATUS_BADGE_BASE} bg-emerald-100 text-emerald-900`;
    case "ממתין למכתב":
      return `${STATUS_BADGE_BASE} bg-rose-100 text-rose-900`;
    case "מכתב נשלח":
      return `${STATUS_BADGE_BASE} bg-fuchsia-100 text-fuchsia-900`;
    case "מכתב התקבל":
      return `${STATUS_BADGE_BASE} bg-green-100 text-green-900`;
    default:
      return `${STATUS_BADGE_BASE} bg-slate-100 text-slate-600`;
  }
}

/** אפשרויות לדרופדאון טבלת הזמנות המצומצמת: אדמין — כל תוויות המחזור; משרד — רק פעולות לוגיסטיקה אחרי תשלום */
export function adminSlimOrderStatusSelectOptions(
  r: AdminDonationRow,
  role: AdminDashboardRole,
): { value: string; label: string }[] {
  if (role === "admin") {
    return ADMIN_ORDER_LIFECYCLE_LABELS_HE.map((label) => ({ value: label, label }));
  }
  const out: { value: string; label: string }[] = [];
  if (paidCompleted(r) && !isPotential(r)) {
    out.push(...ADMIN_MANUAL_ORDER_STATUS_OPTIONS.map((o) => ({ value: o.value, label: o.label })));
  }
  return out;
}

export function isAdminSlimOfficeManualAction(v: string): v is Exclude<AdminManualOrderStatusValue, "" | "mark_paid"> {
  return ADMIN_MANUAL_ORDER_STATUS_OPTIONS.some((o) => o.value === v);
}

/** לסידור בטבלה (מוקדם → מאוחר בתהליך) */
export function adminOrderLifecycleSortRank(r: AdminDonationRow): number {
  const label = adminOrderLifecycleStatusHe(r);
  const list = ADMIN_ORDER_LIFECYCLE_LABELS_HE as readonly string[];
  if (label === "נתרם") return list.indexOf("ממתין למכתב");
  const i = list.indexOf(label);
  return i === -1 ? 99 : i;
}

export function adminManualStatusPatch(value: Exclude<AdminManualOrderStatusValue, "">): AdminDonationPatch {
  switch (value) {
    case "mark_paid":
      return { payment_status: "completed" };
    case "kit_received":
      return { portal_fulfillment_stage: "kit_delivered" };
    case "shipment_collected":
      return { pickup_status: "picked_up", portal_fulfillment_stage: "collected" };
    case "shipment_donated":
      return { delivery_status: "delivered", portal_fulfillment_stage: "donated" };
    case "letter_sent":
      return { letter_status: "sent" };
  }
}

export function canUseAdminManualOrderStatusDropdown(r: AdminDonationRow): boolean {
  return !isPotential(r) && paidCompleted(r);
}
