import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, getAdminSessionFromCookie, verifyAdminSessionCookie } from "@/lib/admin-auth";
import { todayDateIsrael } from "@/lib/admin-today-israel";
import { createServiceRoleClient } from "@/lib/supabase/service";

export const runtime = "nodejs";

const SELECT_FIELDS = [
  "id",
  "created_at",
  "first_name",
  "last_name",
  "child_name",
  "phone",
  "email",
  "address",
  "journey_type",
  "payment_status",
  "letter_status",
  "toy_items",
  "toy_description",
  "ai_generated_letter",
  "scheduled_region",
  "scheduled_slot",
  "pickup_city",
  "amount_paid",
  "pickup_notes",
  "door_code",
  "pickup_date",
  "pickup_time",
  "pickup_address",
  "pickup_status",
  "delivery_status",
  "target_ngo_name",
  "target_ngo_city",
  "delivery_time",
].join(",");

export async function GET() {
  const cookieStore = await cookies();
  const raw = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  if (!verifyAdminSessionCookie(raw)) {
    return NextResponse.json({ error: "אין הרשאה" }, { status: 401 });
  }
  const session = getAdminSessionFromCookie(raw);
  const role = session?.role ?? "admin";

  try {
    const supabase = createServiceRoleClient();
    let q = supabase.from("donations").select(SELECT_FIELDS).order("created_at", { ascending: false });
    if (role === "driver") {
      const today = todayDateIsrael();
      q = q.eq("pickup_date", today).neq("pickup_status", "picked_up");
    }
    const { data, error } = await q;
    if (error) {
      console.error(error);
      return NextResponse.json({ error: "לא ניתן לטעון את הרשומות" }, { status: 500 });
    }
    return NextResponse.json({ donations: data ?? [] });
  } catch (e) {
    console.error(e);
    const msg =
      e instanceof Error && e.message.includes("SUPABASE_SERVICE_ROLE_KEY")
        ? "חסר מפתח שירות ל־Supabase"
        : "שגיאת שרת";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
