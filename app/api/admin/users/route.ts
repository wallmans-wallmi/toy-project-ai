import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionCookie } from "@/lib/admin-auth";
import { hashAdminPassword, normalizeAdminEmail } from "@/lib/admin-user-service";
import { createServiceRoleClient } from "@/lib/supabase/service";

export const runtime = "nodejs";

const createSchema = z.object({
  email: z.string().min(3),
  password: z.string().min(8),
  role: z.enum(["admin", "superadmin"]).optional(),
});

export async function GET() {
  const cookieStore = await cookies();
  const session = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  if (!verifyAdminSessionCookie(session)) {
    return NextResponse.json({ error: "אין הרשאה" }, { status: 401 });
  }
  try {
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase
      .from("admin_users")
      .select("id, email, role, created_at, updated_at")
      .order("created_at", { ascending: true });
    if (error) {
      console.error(error);
      return NextResponse.json({ error: "לא ניתן לטעון משתמשים" }, { status: 500 });
    }
    return NextResponse.json({ users: data ?? [] });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "שגיאת שרת" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const session = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  if (!verifyAdminSessionCookie(session)) {
    return NextResponse.json({ error: "אין הרשאה" }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "גוף הבקשה לא תקין" }, { status: 400 });
  }

  const parsed = createSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "אימייל או סיסמה לא מספיק חזקים (סיסמה לפחות 8 תווים)" }, { status: 400 });
  }

  const email = normalizeAdminEmail(parsed.data.email);
  if (!email.includes("@")) {
    return NextResponse.json({ error: "נראה שחסר @ באימייל — בדקו שוב" }, { status: 400 });
  }

  const password_hash = hashAdminPassword(parsed.data.password);
  const role = parsed.data.role ?? "admin";

  try {
    const supabase = createServiceRoleClient();
    const { error } = await supabase.from("admin_users").insert({
      email,
      password_hash,
      role,
    });
    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: "האימייל הזה כבר קיים אצלנו" }, { status: 409 });
      }
      console.error(error);
      return NextResponse.json({ error: "לא ניתן ליצור משתמש" }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "שגיאת שרת" }, { status: 500 });
  }
}
