/** קוד OTP קבוע לבדיקות מקומיות בלבד (רק כש־`NODE_ENV === "development"`) */
export const DEV_MOCK_OTP_CODE = "111111";

/** מעקף אימות מלא לפיתוח: ללא SMS ל־Supabase, התחברות עם 111111 בלבד */
export function isDevAuthBypassEnabled(): boolean {
  return process.env.NODE_ENV === "development";
}

let devAuthBypassWarned = false;

/** אזהרה חד־פעמית בקונסול כשמצב דמה פעיל */
export function warnDevAuthBypassOnce(): void {
  if (!isDevAuthBypassEnabled() || devAuthBypassWarned) return;
  devAuthBypassWarned = true;
  console.warn("WARNING: Hardcoded OTP (111111) is active. Disable before production.");
}
