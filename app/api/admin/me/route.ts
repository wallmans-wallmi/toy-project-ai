import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, getAdminSessionFromCookie } from "@/lib/admin-auth";
import { getAccountRoleForUser, sessionCanEditAdminCredentials } from "@/lib/admin-team-access";
import { isUndefinedColumnError } from "@/lib/admin-users-schema-compat";
import { createServiceRoleClient } from "@/lib/supabase/service";

export const runtime = "nodejs";

export async function GET() {
  const cookieStore = await cookies();
  const raw = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  const session = getAdminSessionFromCookie(raw);
  if (!session) {
    return NextResponse.json({ error: "אין הרשאה" }, { status: 401 });
  }
  let accountRole: "admin" | "superadmin" = "admin";
  let canEditAdminCredentials = false;
  let username: string | null = null;
  try {
    const supabase = createServiceRoleClient();
    if (session.kind === "v2" && session.sub !== "legacy") {
      accountRole = await getAccountRoleForUser(supabase, session.sub);
      const { data: row, error: nameErr } = await supabase.from("admin_users").select("username").eq("id", session.sub).maybeSingle();
      if (!nameErr && row && typeof (row as { username?: unknown }).username === "string") {
        username = ((row as { username: string }).username ?? "").trim() || null;
      }
      if (nameErr && !isUndefinedColumnError(nameErr)) {
        console.error("[admin/me] username select:", nameErr.message);
      }
    }
    canEditAdminCredentials = await sessionCanEditAdminCredentials(supabase, session);
  } catch {
    accountRole = "admin";
    canEditAdminCredentials = false;
    username = null;
  }
  return NextResponse.json({
    role: session.role,
    email: session.email || null,
    username,
    accountRole,
    canEditAdminCredentials,
  });
}
