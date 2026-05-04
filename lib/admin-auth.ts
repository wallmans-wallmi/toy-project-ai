import { createHmac, timingSafeEqual } from "node:crypto";
import { loadServerEnvOnce } from "@/lib/load-server-env";

export const ADMIN_SESSION_COOKIE = "nifradim_admin_session";
const HMAC_MESSAGE = "nifradim-admin-dashboard-v1";

/** BOM + רווחים — גם בערך מהסביבה וגם בהקלדה */
function normalizePasswordString(raw: string): string {
  return raw.replace(/^\uFEFF/, "").trim();
}

function adminPasswordFromEnv(): string {
  loadServerEnvOnce();
  const raw = process.env.ADMIN_PASSWORD;
  if (typeof raw !== "string") return "";
  return normalizePasswordString(raw);
}

/** הודעת שגיאה אחידה כש־ADMIN_PASSWORD חסר בשרת */
export function adminPasswordMissingMessage(): string {
  return (
    "משתנה הסביבה ADMIN_PASSWORD חסר או ריק בשרת. " +
    "הוסיפו בקובץ .env.local שורה ADMIN_PASSWORD=הסיסמה שלכם, שמרו את הקובץ, " +
    "והפעילו מחדש את שרת הפיתוח (npm run dev). בפריסה (למשל Vercel) הגדירו את המשתנה בהגדרות הפרויקט."
  );
}

/** ערך קוקי סטטי (נגזר מסיסמת האדמין) — בלי DB */
export function computeAdminSessionToken(): string {
  const p = adminPasswordFromEnv();
  if (!p) return "";
  return createHmac("sha256", p).update(HMAC_MESSAGE).digest("hex");
}

export function isAdminPasswordConfigured(): boolean {
  return Boolean(adminPasswordFromEnv());
}

export function verifyAdminPlainPassword(provided: string): boolean {
  const expected = adminPasswordFromEnv();
  const got = normalizePasswordString(provided);
  if (!expected || !got) return false;
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(got, "utf8");
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function verifyAdminSessionCookie(raw: string | undefined): boolean {
  const token = computeAdminSessionToken();
  if (!token || !raw) return false;
  const a = Buffer.from(token, "utf8");
  const b = Buffer.from(raw, "utf8");
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
