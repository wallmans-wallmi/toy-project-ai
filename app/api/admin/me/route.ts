import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, getAdminSessionFromCookie } from "@/lib/admin-auth";
import { getAccountRoleForUser } from "@/lib/admin-team-access";
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
  if (session.kind === "v2" && session.sub !== "legacy") {
    try {
      const supabase = createServiceRoleClient();
      accountRole = await getAccountRoleForUser(supabase, session.sub);
    } catch {
      accountRole = "admin";
    }
  }
  return NextResponse.json({
    role: session.role,
    email: session.email || null,
    accountRole,
  });
}
