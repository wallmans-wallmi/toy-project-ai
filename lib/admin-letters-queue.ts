import type { AdminDonationRow } from "@/hooks/useAdminDonations";

export function getDonationLetterBody(r: AdminDonationRow): string {
  return (r.ai_letter_content || r.ai_generated_letter || "").trim();
}

/** מיפוי ל־שלושה מצבי UI: בהכנה | ממתין למשלוח | נשלח */
export function letterStatusToUi(ls: string | null | undefined): "pending" | "generated" | "sent" {
  const v = ls ?? "pending";
  if (v === "sent" || v === "completed") return "sent";
  if (v === "generated") return "generated";
  return "pending";
}

function deliverySortKey(r: AdminDonationRow): number {
  const t = Date.parse(r.delivery_time ?? "");
  if (Number.isFinite(t)) return t;
  return Date.parse(r.created_at) || 0;
}

/** מיון תור מכתבים — לפי זמן הגעה למחסן/עמותה */
export function sortLettersQueueRows(rows: AdminDonationRow[]): AdminDonationRow[] {
  return [...rows].sort((a, b) => deliverySortKey(a) - deliverySortKey(b));
}
