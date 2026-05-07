import { NextResponse } from "next/server";
import {
  buildCheckoutLeadCaptureApiPayload,
  buildDonationAbandonedCartLeadRow,
  type DonationCheckoutRequestBody,
  validateDonationCheckoutLead,
} from "@/lib/donation-checkout-lead";
import { FUNNEL_POTENTIAL } from "@/lib/donation-funnel-stage";
import { createServiceRoleClient } from "@/lib/supabase/service";

export const runtime = "nodejs";

/**
 * Lead capture / עגלה נטושה: אימות → insert מיידי ל־Supabase (service role, עוקף RLS)
 * עם payment_status = pending.
 *
 * אין כאן תלות בחברת סליקה — גם במסך "תשלום בהדמה" בצד הלקוח, לחיצה על שמירה קוראת לנתיב הזה
 * ורושמת שורה ב־`public.donations` (כולל toy_items, child_name וכו׳) כל עוד האימות עובר.
 */
export async function POST(req: Request) {
  let body: DonationCheckoutRequestBody;
  try {
    body = (await req.json()) as DonationCheckoutRequestBody;
  } catch {
    return NextResponse.json({ error: "גוף הבקשה לא תקין" }, { status: 400 });
  }

  const validated = validateDonationCheckoutLead(body);
  if ("error" in validated) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  try {
    const supabase = createServiceRoleClient();
    const row = buildDonationAbandonedCartLeadRow(validated.ok);
    const upgradeId = validated.ok.upgradeDonationId;

    if (upgradeId) {
      const { data: existing, error: selErr } = await supabase
        .from("donations")
        .select("id, funnel_stage, payment_status")
        .eq("id", upgradeId)
        .maybeSingle();

      if (selErr) {
        console.error(selErr);
        return NextResponse.json({ error: "לא ניתן לשמור את הבקשה כרגע" }, { status: 500 });
      }

      const fs = (existing?.funnel_stage ?? "").trim();
      const ps = (existing?.payment_status ?? "").trim();
      if (!existing?.id || fs !== FUNNEL_POTENTIAL || ps !== "pending") {
        return NextResponse.json({ error: "טיוטה לא נמצאה או כבר לא ניתנת לשדרוג" }, { status: 400 });
      }

      const { data: donation, error: upErr } = await supabase
        .from("donations")
        .update(row)
        .eq("id", upgradeId)
        .select("id, order_number")
        .single();

      if (upErr || !donation?.id || donation.order_number == null) {
        console.error(upErr);
        return NextResponse.json(
          { error: "לא ניתן לשמור את הבקשה כרגע. נסו שוב מאוחר יותר." },
          { status: 500 },
        );
      }

      return NextResponse.json(
        buildCheckoutLeadCaptureApiPayload(donation.id, Number(donation.order_number), validated.ok),
      );
    }

    const { data: donation, error: insertError } = await supabase
      .from("donations")
      .insert(row)
      .select("id, order_number")
      .single();

    if (insertError || !donation?.id || donation.order_number == null) {
      console.error(insertError);
      return NextResponse.json(
        { error: "לא ניתן לשמור את הבקשה כרגע. נסו שוב מאוחר יותר." },
        { status: 500 },
      );
    }

    /** מכתב AI — רק אחרי תשלום מוצלח (webhook Stripe) */

    return NextResponse.json(
      buildCheckoutLeadCaptureApiPayload(donation.id, Number(donation.order_number), validated.ok),
    );
  } catch (e) {
    console.error(e);
    const message =
      e instanceof Error && e.message.includes("SUPABASE_SERVICE_ROLE_KEY")
        ? "השרת לא מוגדר לשמירת תרומות (חסר מפתח שירות ל-Supabase)."
        : "שגיאה פנימית. נסו שוב.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
