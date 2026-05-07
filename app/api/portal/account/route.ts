import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service";

export const runtime = "nodejs";

/** מחיקת חשבון לקוח ב־Auth ובתלות (פרופיל, קישור תרומות) */
export async function DELETE() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();
    if (userErr || !user?.id) {
      return NextResponse.json({ error: "נדרשת התחברות" }, { status: 401 });
    }

    const admin = createServiceRoleClient();
    const { error: delErr } = await admin.auth.admin.deleteUser(user.id);
    if (delErr) {
      console.error(delErr);
      return NextResponse.json({ error: "לא ניתן למחוק את החשבון כרגע" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    const msg =
      e instanceof Error && e.message.includes("SUPABASE_SERVICE_ROLE_KEY")
        ? "השרת לא מוגדר למחיקת חשבון (חסר מפתח שירות)"
        : "שגיאת שרת";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
