import { createHmac, timingSafeEqual } from "node:crypto";

export const ADMIN_SESSION_COOKIE = "nifradim_admin_session";
const HMAC_MESSAGE = "nifradim-admin-dashboard-v1";

/** ערך קוקי סטטי (נגזר מסיסמת האדמין) — בלי DB */
export function computeAdminSessionToken(): string {
  const p = process.env.ADMIN_PASSWORD?.trim();
  if (!p) return "";
  return createHmac("sha256", p).update(HMAC_MESSAGE).digest("hex");
}

export function isAdminPasswordConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD?.trim());
}

export function verifyAdminPlainPassword(provided: string): boolean {
  const expected = process.env.ADMIN_PASSWORD?.trim();
  if (!expected || !provided) return false;
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(provided, "utf8");
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
