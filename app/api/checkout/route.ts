import { NextResponse } from "next/server";
import {
  buildCheckoutLeadCaptureApiPayload,
  buildDonationAbandonedCartLeadRow,
  type DonationCheckoutRequestBody,
  validateDonationCheckoutLead,
} from "@/lib/donation-journey";
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
    const { data: donation, error: insertError } = await supabase
      .from("donations")
      .insert(row)
      .select("id")
      .single();

    if (insertError || !donation?.id) {
      console.error(insertError);
      return NextResponse.json(
        { error: "לא ניתן לשמור את הבקשה כרגע. נסו שוב מאוחר יותר." },
        { status: 500 },
      );
    }

    /** מכתב AI — רק אחרי תשלום מוצלח (webhook Stripe) */

    return NextResponse.json(buildCheckoutLeadCaptureApiPayload(donation.id, validated.ok));
  } catch (e) {
    console.error(e);
    const message =
      e instanceof Error && e.message.includes("SUPABASE_SERVICE_ROLE_KEY")
        ? "השרת לא מוגדר לשמירת תרומות (חסר מפתח שירות ל-Supabase)."
        : "שגיאה פנימית. נסו שוב.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
