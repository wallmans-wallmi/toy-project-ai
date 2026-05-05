import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { ADMIN_SESSION_COOKIE, getAdminSessionFromCookie, verifyAdminSessionCookie } from "@/lib/admin-auth";
import { canAccessTeamManagement } from "@/lib/admin-team-access";
import { upsertAdminProfile } from "@/lib/admin-profile-service";
import type { AdminDashboardRole } from "@/lib/admin-role-types";
import { hashAdminPassword, normalizeAdminEmail } from "@/lib/admin-user-service";
import { createServiceRoleClient } from "@/lib/supabase/service";

export const runtime = "nodejs";

const createSchema = z.object({
  email: z.string().min(3),
  password: z.string().min(8),
  role: z.enum(["admin", "superadmin"]).optional(),
  logisticsRole: z.enum(["admin", "office", "driver"]).optional(),
});

export async function GET() {
  const cookieStore = await cookies();
  const raw = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  if (!verifyAdminSessionCookie(raw)) {
    return NextResponse.json({ error: "אין הרשאה" }, { status: 401 });
  }
  const session = getAdminSessionFromCookie(raw);
  try {
    const supabase = createServiceRoleClient();
    if (!(await canAccessTeamManagement(supabase, session))) {
      return NextResponse.json({ error: "אין הרשאה לניהול צוות" }, { status: 403 });
    }
    const { data: users, error } = await supabase
      .from("admin_users")
      .select("id, email, role, created_at, updated_at")
      .order("created_at", { ascending: true });
    if (error) {
      console.error(error);
      return NextResponse.json({ error: "לא ניתן לטעון משתמשים" }, { status: 500 });
    }
    const list = users ?? [];
    const ids = list.map((u) => u.id);
    let profileMap = new Map<string, AdminDashboardRole>();
    if (ids.length > 0) {
      const { data: profiles } = await supabase.from("admin_profiles").select("user_id, role").in("user_id", ids);
      for (const p of profiles ?? []) {
        const lr = p.role as AdminDashboardRole;
        if (lr === "office" || lr === "driver" || lr === "admin") profileMap.set(p.user_id, lr);
      }
    }
    const merged = list.map((u) => ({
      id: u.id,
      email: u.email,
      account_role: u.role,
      logistics_role: profileMap.get(u.id) ?? "admin",
      created_at: u.created_at,
      updated_at: u.updated_at,
    }));
    return NextResponse.json({ users: merged });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "שגיאת שרת" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const raw = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  if (!verifyAdminSessionCookie(raw)) {
    return NextResponse.json({ error: "אין הרשאה" }, { status: 401 });
  }
  const session = getAdminSessionFromCookie(raw);
  let supabase: ReturnType<typeof createServiceRoleClient>;
  try {
    supabase = createServiceRoleClient();
  } catch {
    return NextResponse.json({ error: "שרת לא מוגדר" }, { status: 500 });
  }
  if (!(await canAccessTeamManagement(supabase, session))) {
    return NextResponse.json({ error: "אין הרשאה" }, { status: 403 });
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
  const logisticsRole = parsed.data.logisticsRole ?? "admin";

  try {
    const { data: created, error } = await supabase
      .from("admin_users")
      .insert({
        email,
        password_hash,
        role,
      })
      .select("id")
      .single();
    if (error || !created?.id) {
      if (error?.code === "23505") {
        return NextResponse.json({ error: "האימייל הזה כבר קיים אצלנו" }, { status: 409 });
      }
      console.error(error);
      return NextResponse.json({ error: "לא ניתן ליצור משתמש" }, { status: 500 });
    }
    await upsertAdminProfile(supabase, created.id, logisticsRole);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "שגיאת שרת" }, { status: 500 });
  }
}
