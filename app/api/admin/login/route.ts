import { loadServerEnvOnce } from "@/lib/load-server-env";
import { NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  adminPasswordMissingMessage,
  computeAdminSessionToken,
  isAdminPasswordConfigured,
  signAdminSessionV2,
  verifyAdminPlainPassword,
} from "@/lib/admin-auth";
import { getLogisticsRoleForUser } from "@/lib/admin-profile-service";
import { countAdminUsers, normalizeAdminEmail, verifyAdminUserPassword } from "@/lib/admin-user-service";
import { createServiceRoleClient } from "@/lib/supabase/service";

export const runtime = "nodejs";

loadServerEnvOnce();

export async function POST(req: Request) {
  loadServerEnvOnce();
  let body: { email?: string; password?: string };
  try {
    body = (await req.json()) as { email?: string; password?: string };
  } catch {
    return NextResponse.json({ error: "גוף הבקשה לא תקין" }, { status: 400 });
  }
  const password = typeof body.password === "string" ? body.password : "";
  const emailRaw = typeof body.email === "string" ? body.email : "";

  let supabase: ReturnType<typeof createServiceRoleClient>;
  try {
    supabase = createServiceRoleClient();
  } catch {
    return NextResponse.json({ error: "השרת לא מחובר למסד — בדקו את Supabase" }, { status: 500 });
  }

  const dbCount = await countAdminUsers(supabase);
  const useDatabaseAdmins = dbCount !== null && dbCount > 0;

  if (useDatabaseAdmins) {
    const email = normalizeAdminEmail(emailRaw);
    if (!email) {
      return NextResponse.json(
        { error: "חסר אימייל — תכתבו את האימייל שהוגדר לכם בצוות, אחותי" },
        { status: 400 },
      );
    }
    const user = await verifyAdminUserPassword(supabase, email, password);
    if (!user) {
      return NextResponse.json({ error: "אימייל או סיסמה לא מתאימים — נסו שוב בנחת" }, { status: 401 });
    }
    const logisticsRole = await getLogisticsRoleForUser(supabase, user.id);
    const token = signAdminSessionV2({
      sub: user.id,
      email: user.email,
      role: logisticsRole,
    });
    if (!token) {
      console.error("[נפרדים בחיוך][admin-login] חסר מפתח לחתימת סשן (ADMIN_SESSION_SECRET או SUPABASE_SERVICE_ROLE_KEY).");
      return NextResponse.json(
        { error: "משהו בתצורת השרת חסר — כתבו לתמיכה, בינתיים ננסה לסדר את זה" },
        { status: 500 },
      );
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

  if (!isAdminPasswordConfigured()) {
    loadServerEnvOnce();
    if (!isAdminPasswordConfigured()) {
      console.error(
        "[נפרדים בחיוך][admin-login] אין משתמשי admin_users וגם אין ADMIN_PASSWORD — אי אפשר להיכנס.",
      );
      return NextResponse.json({ error: adminPasswordMissingMessage() }, { status: 503 });
    }
  }
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
