import { createHmac, timingSafeEqual } from "node:crypto";
import { loadServerEnvOnce } from "@/lib/load-server-env";

export const ADMIN_SESSION_COOKIE = "nifradim_admin_session";
const HMAC_MESSAGE = "nifradim-admin-dashboard-v1";

type SessionPayloadV2 = {
  v: 2;
  sub: string;
  email: string;
  role: string;
  exp: number;
};

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

function adminSessionSecret(): string {
  loadServerEnvOnce();
  const explicit = process.env.ADMIN_SESSION_SECRET;
  if (typeof explicit === "string" && explicit.trim() !== "") {
    return explicit.trim();
  }
  const sr = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (typeof sr === "string" && sr.length >= 32) {
    return createHmac("sha256", sr).update("nifradim-admin-session-v2").digest("hex");
  }
  return "";
}

function timingSafeEqualB64Url(a: string, b: string): boolean {
  const ba = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  if (ba.length !== bb.length) return false;
  try {
    return timingSafeEqual(ba, bb);
  } catch {
    return false;
  }
}

/** הודעת שגיאה (קול אושיה) כשאין דרך התחברות מוגדרת */
export function adminPasswordMissingMessage(): string {
  return (
    "אופס — אין לנו כרגע דרך להכניס אתכם: חסרים גם משתמשי אדמין בטבלה וגם ADMIN_PASSWORD בסביבה. " +
    "הוסיפו משתמש ב־/admin/users (אחרי שמישהו כבר נכנס פעם ראשונה), או הגדירו ADMIN_PASSWORD ב־.env.local והפעילו מחדש את השרת."
  );
}

/** טוקן legacy — נגזר מסיסמת הסביבה */
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

/** סשן אחרי התחברות מול טבלת admin_users */
export function signAdminSessionV2(input: {
  sub: string;
  email: string;
  role: string;
  maxAgeSec?: number;
}): string {
  const secret = adminSessionSecret();
  if (!secret) return "";
  const maxAge = input.maxAgeSec ?? 60 * 60 * 12;
  const body: SessionPayloadV2 = {
    v: 2,
    sub: input.sub,
    email: input.email,
    role: input.role,
    exp: Math.floor(Date.now() / 1000) + maxAge,
  };
  const bodyB64 = Buffer.from(JSON.stringify(body), "utf8").toString("base64url");
  const sig = createHmac("sha256", secret).update(bodyB64).digest("base64url");
  return `v2.${bodyB64}.${sig}`;
}

function verifyAdminSessionV2(raw: string): boolean {
  const prefix = "v2.";
  if (!raw.startsWith(prefix)) return false;
  const rest = raw.slice(prefix.length);
  const dot = rest.lastIndexOf(".");
  if (dot <= 0) return false;
  const bodyB64 = rest.slice(0, dot);
  const sig = rest.slice(dot + 1);
  const secret = adminSessionSecret();
  if (!secret) return false;
  const expectedSig = createHmac("sha256", secret).update(bodyB64).digest("base64url");
  if (!timingSafeEqualB64Url(sig, expectedSig)) return false;
  try {
    const parsed = JSON.parse(Buffer.from(bodyB64, "base64url").toString("utf8")) as SessionPayloadV2;
    if (parsed.v !== 2 || typeof parsed.exp !== "number") return false;
    if (parsed.exp * 1000 < Date.now()) return false;
    return true;
  } catch {
    return false;
  }
}

function verifyLegacyAdminSessionCookie(raw: string | undefined): boolean {
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

export function verifyAdminSessionCookie(raw: string | undefined): boolean {
  if (!raw) return false;
  if (raw.startsWith("v2.")) return verifyAdminSessionV2(raw);
  return verifyLegacyAdminSessionCookie(raw);
}
