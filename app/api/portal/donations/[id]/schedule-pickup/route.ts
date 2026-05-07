import { NextResponse } from "next/server";
import { validatePortalSchedulePickupBody } from "@/lib/portal/validate-portal-schedule-pickup";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service";

export const runtime = "nodejs";

type RouteParams = { params: Promise<{ id: string }> };

/** תיאום או עדכון איסוף בפורטל: רק משלב ערכה הוגדרה כהגיעה, או עריכה כשכבר תואם */
export async function POST(req: Request, ctx: RouteParams) {
  const { id: donationId } = await ctx.params;
  if (!donationId) {
    return NextResponse.json({ error: "חסר מזהה בקשה" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "גוף הבקשה לא תקין" }, { status: 400 });
  }

  const validated = validatePortalSchedulePickupBody(body);
  if ("error" in validated) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }
  const v = validated.ok;

  const raw = body as Record<string, unknown>;
  const pickupCityRaw = raw["pickupCity"];
  const pickupCityTrim = typeof pickupCityRaw === "string" ? pickupCityRaw.trim() : "";

  const supabase = await createClient();
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();
  if (userErr || !user?.id) {
    return NextResponse.json({ error: "נדרשת התחברות" }, { status: 401 });
  }

  const admin = createServiceRoleClient();
  const { data: row, error: fetchErr } = await admin
    .from("donations")
    .select("id, customer_user_id, portal_fulfillment_stage")
    .eq("id", donationId)
    .maybeSingle();

  if (fetchErr || !row) {
    return NextResponse.json({ error: "הבקשה לא נמצאה" }, { status: 404 });
  }
  if (row.customer_user_id !== user.id) {
    return NextResponse.json({ error: "אין הרשאה" }, { status: 403 });
  }

  const stage = typeof row.portal_fulfillment_stage === "string" ? row.portal_fulfillment_stage.trim() : "";
  if (stage !== "kit_delivered" && stage !== "pickup_scheduled") {
    return NextResponse.json({ error: "לא ניתן לעדכן את מועד האיסוף בשלב הנוכחי" }, { status: 409 });
  }

  const updatePayload: Record<string, unknown> = {
    scheduled_region: v.region,
    pickup_slot_id: v.pickupSlotId,
    pickup_weekday: v.pickupWeekday,
    scheduled_slot: v.scheduledSlotLabel,
    pickup_date: v.pickupDateIso,
    portal_fulfillment_stage: "pickup_scheduled",
  };
  if (pickupCityTrim.length > 0) {
    updatePayload.pickup_city = pickupCityTrim;
  }

  const { error: upErr } = await admin.from("donations").update(updatePayload).eq("id", donationId);
  if (upErr) {
    console.error(upErr);
    return NextResponse.json({ error: "לא ניתן לשמור את התיאום" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
