import { NextResponse } from "next/server";
import { buildDonationDraftRow, validateDonationDraftBody } from "@/lib/donation-checkout-draft";
import { FUNNEL_POTENTIAL } from "@/lib/donation-funnel-stage";
import { createServiceRoleClient } from "@/lib/supabase/service";

export const runtime = "nodejs";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * שמירת ליד אמצע משפך: אחרי מילוי פרטים והמשך, לפני מסך תשלום.
 * `funnel_stage` = potential. אפשר לעדכן שורה קיימת עם `donationId` אם היא עדיין טיוטה.
 */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "גוף הבקשה לא תקין" }, { status: 400 });
  }

  const validated = validateDonationDraftBody(body);
  if ("error" in validated) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  const { donationId, form, pickupSimplified } = validated.ok;
  const row = buildDonationDraftRow(form, pickupSimplified === true);

  try {
    const supabase = createServiceRoleClient();

    if (donationId && UUID_RE.test(donationId)) {
      const { data: existing, error: selErr } = await supabase
        .from("donations")
        .select("id, funnel_stage, payment_status")
        .eq("id", donationId)
        .maybeSingle();

      if (selErr) {
        console.error(selErr);
        return NextResponse.json({ error: "לא ניתן לעדכן את הטיוטה כרגע" }, { status: 500 });
      }

      const fs = (existing?.funnel_stage ?? "").trim();
      const ps = (existing?.payment_status ?? "").trim();
      if (!existing?.id || fs !== FUNNEL_POTENTIAL || ps !== "pending") {
        return NextResponse.json({ error: "טיוטה לא נמצאה או כבר לא ניתנת לעדכון" }, { status: 400 });
      }

      const { data: updated, error: upErr } = await supabase
        .from("donations")
        .update(row)
        .eq("id", donationId)
        .select("id, order_number")
        .single();

      if (upErr || !updated?.id) {
        console.error(upErr);
        return NextResponse.json({ error: "לא ניתן לעדכן את הטיוטה" }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        donation_id: updated.id,
        order_number: updated.order_number != null ? Number(updated.order_number) : undefined,
        draft: true,
      });
    }

    const { data: inserted, error: insErr } = await supabase
      .from("donations")
      .insert(row)
      .select("id, order_number")
      .single();

    if (insErr || !inserted?.id) {
      console.error(insErr);
      return NextResponse.json({ error: "לא ניתן לשמור את הטיוטה כרגע. נסו שוב מאוחר יותר." }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      donation_id: inserted.id,
      order_number: inserted.order_number != null ? Number(inserted.order_number) : undefined,
      draft: true,
    });
  } catch (e) {
    console.error(e);
    const message =
      e instanceof Error && e.message.includes("SUPABASE_SERVICE_ROLE_KEY")
        ? "השרת לא מוגדר לשמירת תרומות (חסר מפתח שירות ל-Supabase)."
        : "שגיאה פנימית. נסו שוב.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
