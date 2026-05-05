import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { ADMIN_SESSION_COOKIE, getAdminSessionFromCookie, verifyAdminSessionCookie } from "@/lib/admin-auth";
import { canAccessTeamManagement, sessionCanEditAdminCredentials } from "@/lib/admin-team-access";
import { upsertAdminProfile } from "@/lib/admin-profile-service";
import type { AdminDashboardRole } from "@/lib/admin-role-types";
import { isUndefinedColumnError } from "@/lib/admin-users-schema-compat";
import { hashAdminPassword, normalizeAdminEmail } from "@/lib/admin-user-service";
import { createServiceRoleClient } from "@/lib/supabase/service";

export const runtime = "nodejs";

const createSchema = z.object({
  email: z.string().min(3),
  password: z.string().min(8),
  /** שם תצוגה — לא משמש לכניסה */
  username: z.string().max(80).optional(),
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
    let list: {
      id: string;
      email: string;
      username?: string | null;
      role: string;
      created_at: string;
      updated_at: string;
    }[] = [];
    const fullSelect = await supabase
      .from("admin_users")
      .select("id, email, username, role, created_at, updated_at")
      .order("created_at", { ascending: true });
    if (fullSelect.error) {
      if (isUndefinedColumnError(fullSelect.error)) {
        const slim = await supabase.from("admin_users").select("id, email, role, created_at, updated_at").order("created_at", { ascending: true });
        if (slim.error) {
          console.error(slim.error);
          return NextResponse.json({ error: "לא ניתן לטעון משתמשים" }, { status: 500 });
        }
        list = (slim.data ?? []).map((u) => ({ ...u, username: null as string | null }));
      } else {
        console.error(fullSelect.error);
        return NextResponse.json({ error: "לא ניתן לטעון משתמשים" }, { status: 500 });
      }
    } else {
      list = (fullSelect.data ?? []) as typeof list;
    }
    const ids = list.map((u) => u.id);
    let profileMap = new Map<string, AdminDashboardRole>();
    if (ids.length > 0) {
      const { data: profiles } = await supabase.from("admin_profiles").select("user_id, role").in("user_id", ids);
      for (const p of profiles ?? []) {
        const lr = p.role as AdminDashboardRole;
        if (lr === "office" || lr === "driver" || lr === "admin") profileMap.set(p.user_id, lr);
      }
    }
    const merged = list.map((u) => {
      const row = u as { id: string; email: string; username?: string | null; role: string; created_at: string; updated_at: string };
      return {
        id: row.id,
        email: row.email,
        username: row.username ?? null,
        account_role: row.role,
        logistics_role: profileMap.get(row.id) ?? "admin",
        created_at: row.created_at,
        updated_at: row.updated_at,
      };
    });
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
  if (!(await sessionCanEditAdminCredentials(supabase, session))) {
    return NextResponse.json({ error: "אין הרשאה להגדיר סיסמה או ליצור משתמש כאן" }, { status: 403 });
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
  const usernameRaw = typeof parsed.data.username === "string" ? parsed.data.username.trim() : "";
  const username = usernameRaw.length > 0 ? usernameRaw.slice(0, 80) : null;

  const baseInsert = { email, password_hash, role };
  const insertWithOptionalUsername =
    username !== null && username !== "" ? { ...baseInsert, username } : baseInsert;

  try {
    let { data: created, error } = await supabase.from("admin_users").insert(insertWithOptionalUsername).select("id").single();
    if (error && username && isUndefinedColumnError(error)) {
      const retry = await supabase.from("admin_users").insert(baseInsert).select("id").single();
      created = retry.data;
      error = retry.error;
    }
    if (error || !created?.id) {
      if (error?.code === "23505") {
        return NextResponse.json({ error: "האימייל הזה כבר קיים אצלנו" }, { status: 409 });
      }
      console.error("[admin/users POST]", error);
      return NextResponse.json(
        { error: "לא ניתן ליצור משתמש", detail: process.env.NODE_ENV === "development" ? error?.message : undefined },
        { status: 500 },
      );
    }
    await upsertAdminProfile(supabase, created.id, logisticsRole);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "שגיאת שרת" }, { status: 500 });
  }
}
