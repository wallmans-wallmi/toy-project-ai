import { loadServerEnvOnce } from "@/lib/load-server-env";
import { NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  adminPasswordMissingMessage,
  computeAdminSessionToken,
  isAdminPasswordConfigured,
  verifyAdminPlainPassword,
} from "@/lib/admin-auth";

export const runtime = "nodejs";

/** טעינת env לפני כל לוגיקה — גם בקור ראשון ל־lambda */
loadServerEnvOnce();

export async function POST(req: Request) {
  loadServerEnvOnce();
  if (!isAdminPasswordConfigured()) {
    loadServerEnvOnce();
    if (!isAdminPasswordConfigured()) {
      console.error(
        "[נפרדים בחיוך][admin-login] ADMIN_PASSWORD חסר או ריק ב-process.env אחרי טעינת הסביבה. " +
          "בדקו .env.local והפעלה מחדש של שרת הפיתוח, או משתני סביבה בפריסה.",
      );
      return NextResponse.json({ error: adminPasswordMissingMessage() }, { status: 503 });
    }
  }
  let body: { password?: string };
  try {
    body = (await req.json()) as { password?: string };
  } catch {
    return NextResponse.json({ error: "גוף הבקשה לא תקין" }, { status: 400 });
  }
  const password = typeof body.password === "string" ? body.password : "";
  if (!verifyAdminPlainPassword(password)) {
    return NextResponse.json({ error: "סיסמה לא נכונה" }, { status: 401 });
  }
  const token = computeAdminSessionToken();
  if (!token) {
    return NextResponse.json({ error: "שגיאת הגדרת שרת" }, { status: 500 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  return res;
}
