import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionCookie } from "@/lib/admin-auth";
import { hashAdminPassword, normalizeAdminEmail } from "@/lib/admin-user-service";
import { createServiceRoleClient } from "@/lib/supabase/service";

export const runtime = "nodejs";

const patchSchema = z.object({
  email: z.string().min(3).optional(),
  password: z.string().min(8).optional(),
  role: z.enum(["admin", "superadmin"]).optional(),
});

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, context: RouteContext) {
  const cookieStore = await cookies();
  const session = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  if (!verifyAdminSessionCookie(session)) {
    return NextResponse.json({ error: "אין הרשאה" }, { status: 401 });
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
  if (!parsed.success || Object.keys(parsed.data).length === 0) {
    return NextResponse.json({ error: "אין מה לעדכן" }, { status: 400 });
  }

  const patch: Record<string, string> = {};
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

  try {
    const supabase = createServiceRoleClient();
    const { error } = await supabase.from("admin_users").update(patch).eq("id", id);
    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: "האימייל תפוס" }, { status: 409 });
      }
      console.error(error);
      return NextResponse.json({ error: "העדכון נכשל" }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "שגיאת שרת" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, context: RouteContext) {
  const cookieStore = await cookies();
  const session = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  if (!verifyAdminSessionCookie(session)) {
    return NextResponse.json({ error: "אין הרשאה" }, { status: 401 });
  }

  const { id } = await context.params;
  if (!z.string().uuid().safeParse(id).success) {
    return NextResponse.json({ error: "מזהה לא תקין" }, { status: 400 });
  }

  try {
    const supabase = createServiceRoleClient();
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
