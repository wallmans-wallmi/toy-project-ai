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

const patchSchema = z.object({
  email: z.string().min(3).optional(),
  password: z.string().min(8).optional(),
  role: z.enum(["admin", "superadmin"]).optional(),
  logisticsRole: z.enum(["admin", "office", "driver"]).optional(),
  /** שם תצוגה — ריק מנקה; לא משפיע על כניסה */
  username: z.string().max(80).optional(),
});

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, context: RouteContext) {
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

  const { id } = await context.params;
  if (!z.string().uuid().safeParse(id).success) {
    return NextResponse.json({ error: "מזהה לא תקין" }, { status: 400 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "גוף הבקשה לא תקין" }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "נתונים לא תקינים" }, { status: 400 });
  }
  const hasCredentialFields =
    parsed.data.email !== undefined || parsed.data.password !== undefined || parsed.data.role !== undefined;
  const hasLogistics = parsed.data.logisticsRole !== undefined;
  const hasUsername = parsed.data.username !== undefined;
  if (!hasCredentialFields && !hasLogistics && !hasUsername) {
    return NextResponse.json({ error: "אין מה לעדכן" }, { status: 400 });
  }

  if (hasCredentialFields && !(await sessionCanEditAdminCredentials(supabase, session))) {
    return NextResponse.json({ error: "אין הרשאה לעריכת אימייל או סיסמה" }, { status: 403 });
  }

  const patch: Record<string, string | null> = {};
  if (parsed.data.email !== undefined) {
    const em = normalizeAdminEmail(parsed.data.email);
    if (!em.includes("@")) {
      return NextResponse.json({ error: "אימייל לא תקין" }, { status: 400 });
    }
    patch.email = em;
  }
  if (parsed.data.password !== undefined) {
    patch.password_hash = hashAdminPassword(parsed.data.password);
  }
  if (parsed.data.role !== undefined) {
    patch.role = parsed.data.role;
  }
  if (hasUsername) {
    const u = parsed.data.username!.trim();
    patch.username = u === "" ? null : u.slice(0, 80);
  }

  try {
    if (Object.keys(patch).length > 0) {
      let { error } = await supabase.from("admin_users").update(patch).eq("id", id);
      if (error && patch.username !== undefined && isUndefinedColumnError(error)) {
        const { username: _drop, ...rest } = patch;
        if (Object.keys(rest).length > 0) {
          const second = await supabase.from("admin_users").update(rest).eq("id", id);
          error = second.error;
        } else {
          error = null;
        }
      }
      if (error) {
        if (error.code === "23505") {
          return NextResponse.json({ error: "האימייל תפוס" }, { status: 409 });
        }
        console.error(error);
        return NextResponse.json({ error: "העדכון נכשל" }, { status: 500 });
      }
    }
    if (hasLogistics && parsed.data.logisticsRole) {
      await upsertAdminProfile(supabase, id, parsed.data.logisticsRole as AdminDashboardRole);
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "שגיאת שרת" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, context: RouteContext) {
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

  const { id } = await context.params;
  if (!z.string().uuid().safeParse(id).success) {
    return NextResponse.json({ error: "מזהה לא תקין" }, { status: 400 });
  }
  if (session?.kind === "v2" && session.sub === id) {
    return NextResponse.json({ error: "לא מוחקים את עצמנו — זה לא טיקטוק" }, { status: 400 });
  }

  try {
    const { error } = await supabase.from("admin_users").delete().eq("id", id);
    if (error) {
      console.error(error);
      return NextResponse.json({ error: "המחיקה נכשלה" }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "שגיאת שרת" }, { status: 500 });
  }
}
