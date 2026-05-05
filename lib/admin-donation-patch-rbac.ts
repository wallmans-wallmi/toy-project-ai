import type { AdminDashboardRole } from "@/lib/admin-role-types";

const DRIVER = new Set(["pickup_status", "delivery_status"]);
const OFFICE = new Set([
  "letter_status",
  "first_name",
  "last_name",
  "phone",
  "email",
  "address",
  "child_name",
  "pickup_notes",
  "door_code",
  "pickup_address",
  "target_ngo_name",
  "target_ngo_city",
]);

export function donationPatchForbiddenMessage(role: AdminDashboardRole, patchKeys: string[]): string | null {
  const keys = patchKeys.filter((k) => k !== "id");
  if (keys.length === 0) return "חובה לשלוח שדה לעדכון";
  if (role === "admin") return null;
  const allowed = role === "driver" ? DRIVER : OFFICE;
  for (const k of keys) {
    if (!allowed.has(k)) {
      return role === "driver"
        ? "לנהגים אפשר רק לעדכן סטטוס איסוף או משלוח — בלי טריקים"
        : "למשרד אפשר מכתב ופרטי תורם בלבד";
    }
  }
  return null;
}
