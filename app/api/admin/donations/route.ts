import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionCookie } from "@/lib/admin-auth";
import { createServiceRoleClient } from "@/lib/supabase/service";

export const runtime = "nodejs";

export async function GET() {
  const cookieStore = await cookies();
  const session = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  if (!verifyAdminSessionCookie(session)) {
    return NextResponse.json({ error: "אין הרשאה" }, { status: 401 });
  }
  try {
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase
      .from("donations")
      .select(
        [
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
        ].join(","),
      )
      .order("created_at", { ascending: false });

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
