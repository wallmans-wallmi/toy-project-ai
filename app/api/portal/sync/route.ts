import { NextResponse } from "next/server";
import type { User } from "@supabase/supabase-js";
import { runPortalCustomerSync } from "@/lib/portal/sync-customer";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service";

export const runtime = "nodejs";

function resolveSessionPhone(user: User): string | null {
  const direct = user.phone?.trim();
  if (direct) return direct;
  const meta = user.user_metadata;
  if (meta && typeof meta === "object") {
    const p = "phone" in meta && typeof meta.phone === "string" ? meta.phone.trim() : "";
    if (p) return p;
    const e = "phone_e164" in meta && typeof meta.phone_e164 === "string" ? meta.phone_e164.trim() : "";
    if (e) return e;
  }
  return null;
}

/** סנכרון פרופיל והזמנות לפי טלפון Auth מול טבלת donations (דורש משתמש מחובר) */
export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();
    if (userErr || !user?.id) {
      return NextResponse.json({ error: "נדרשת התחברות" }, { status: 401 });
    }
    const phone = resolveSessionPhone(user);
    if (!phone) {
      return NextResponse.json({ error: "חסר מספר טלפון בחשבון" }, { status: 400 });
    }

    let admin: ReturnType<typeof createServiceRoleClient>;
    try {
      admin = createServiceRoleClient();
    } catch {
      return NextResponse.json({ error: "השרת לא מוגדר לסנכרון (חסר מפתח שירות)" }, { status: 500 });
    }
    const result = await runPortalCustomerSync(admin, user.id, phone);
    if (!result.ok) {
      if (process.env.NODE_ENV === "development") {
        console.error("[api/portal/sync]", result.error);
      }
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
    return NextResponse.json({
      success: true,
      linkedDonations: result.linkedDonations,
      profileCreated: result.profileCreated,
    });
  } catch (e) {
    const msg =
      e instanceof Error && e.message.includes("SUPABASE_SERVICE_ROLE_KEY")
        ? "השרת לא מוגדר לסנכרון (חסר מפתח שירות)"
        : "שגיאת שרת";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
