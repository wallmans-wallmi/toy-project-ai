/** תפקיד במערכת הלוגיסטיקה — מגיע מ־admin_profiles (או ברירת מחדל admin) */
export type AdminDashboardRole = "admin" | "office" | "driver";

export function normalizeDashboardRole(raw: string | null | undefined): AdminDashboardRole {
  if (raw === "office" || raw === "driver") return raw;
  return "admin";
}
