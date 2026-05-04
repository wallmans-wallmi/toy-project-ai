import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { countAdminUsers } from "@/lib/admin-user-service";
import { isAdminPasswordConfigured } from "@/lib/admin-auth";
import { loadServerEnvOnce } from "@/lib/load-server-env";

export const runtime = "nodejs";

loadServerEnvOnce();

/** ללא אימות — מספר אם נדרש אימייל לצד הסיסמה */
export async function GET() {
  try {
    const supabase = createServiceRoleClient();
    const n = await countAdminUsers(supabase);
    const dbReady = n !== null && n > 0;
    return NextResponse.json({
      requiresEmail: dbReady,
      legacyPasswordAvailable: isAdminPasswordConfigured(),
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { requiresEmail: false, legacyPasswordAvailable: isAdminPasswordConfigured() },
      { status: 200 },
    );
  }
}
