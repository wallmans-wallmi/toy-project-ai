import { NextResponse } from "next/server";
import { PICKUP_FEE_AGOROT, PICKUP_FEE_ILS } from "@/lib/constants/pricing";
import { isDonationJourneyId } from "@/lib/donation-journey";
import { getRegionById, getSlotForRegion } from "@/lib/pickup-regions";
import { formatPickupTimeSummaryLine } from "@/lib/pickup-schedule-slots";
import { getStripe } from "@/lib/stripe/server";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { formatToyDescriptionFromPayloads, isToySizeId, type ToyItemPayload } from "@/lib/toy-donation";

export const runtime = "nodejs";

type Body = {
  firstName?: string;
  lastName?: string;
  childName?: string;
  journeyType?: string;
  phone?: string;
  email?: string;
  address?: string;
  doorCode?: string;
  region?: string;
  toyItems?: unknown;
  toysQualityConfirmed?: boolean;
  termsAccepted?: boolean;
  pickupSlotId?: string | null;
  pickupDate?: string;
  pickupNotes?: string;
};

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function parseToyItemsPayload(raw: unknown): ToyItemPayload[] | null {
  if (!Array.isArray(raw)) return null;
  const out: ToyItemPayload[] = [];
  for (const entry of raw) {
    if (!entry || typeof entry !== "object") return null;
    const o = entry as Record<string, unknown>;
    const name = typeof o.name === "string" ? o.name.trim() : "";
    const color = typeof o.color === "string" ? o.color.trim() : "";
    const size = o.size;
    if (!name || !color || !isToySizeId(size)) return null;
    out.push({ name, color, size });
  }
  return out;
}

export async function POST(req: Request) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "גוף הבקשה לא תקין" }, { status: 400 });
  }

  const firstName = body.firstName?.trim();
  const lastName = body.lastName?.trim();
  const childName = body.childName?.trim() ?? "";
  const phone = body.phone?.trim();
  const email = body.email?.trim() ?? "";
  const address = body.address?.trim();
  const doorCode = body.doorCode?.trim() ?? "";
  const region = body.region?.trim();
  const pickupNotes = body.pickupNotes?.trim() ?? "";
  const pickupSlotId = body.pickupSlotId?.trim() ?? "";
  const pickupDateRaw = body.pickupDate?.trim() ?? "";
  const toysQualityConfirmed = body.toysQualityConfirmed === true;
  const termsAccepted = body.termsAccepted === true;
  const journeyTypeRaw = body.journeyType;

  const toyPayloads = parseToyItemsPayload(body.toyItems);

  if (!isDonationJourneyId(journeyTypeRaw)) {
    return NextResponse.json({ error: "נא לבחור את המשימה שלכם לפני התשלום" }, { status: 400 });
  }

  if (!toyPayloads || toyPayloads.length === 0) {
    return NextResponse.json({ error: "נא למלא לפחות פריט אחד עם כל השדות" }, { status: 400 });
  }

  if (!toysQualityConfirmed) {
    return NextResponse.json({ error: "נא לאשר את מצב הפריטים לפני התשלום" }, { status: 400 });
  }

  if (!childName) {
    return NextResponse.json({ error: "נא למלא את שם הילד או הילדה" }, { status: 400 });
  }

  if (!termsAccepted) {
    return NextResponse.json({ error: "נא לאשר את תנאי השירות לפני התשלום" }, { status: 400 });
  }

  if (!firstName || !lastName || !phone || !address || !region) {
    return NextResponse.json({ error: "חסרים שדות חובה" }, { status: 400 });
  }

  if (!email || !isValidEmail(email)) {
    return NextResponse.json({ error: "נא למלא אימייל תקין" }, { status: 400 });
  }

  const regionMeta = getRegionById(region);
  const slot = pickupSlotId ? getSlotForRegion(region, pickupSlotId) : undefined;
  if (!regionMeta || !slot) {
    return NextResponse.json({ error: "אזור או חלון זמן לא תקינים" }, { status: 400 });
  }

  const pickupDateOk = pickupDateRaw ? /^\d{4}-\d{2}-\d{2}$/.test(pickupDateRaw) : false;
  const scheduledSlotLabel =
    pickupDateOk && pickupDateRaw
      ? formatPickupTimeSummaryLine(pickupDateRaw, pickupSlotId, slot.label)
      : slot.label;

  const toyDescription = formatToyDescriptionFromPayloads(toyPayloads);

  const origin =
    req.headers.get("origin") ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    "http://localhost:3000";

  try {
    const supabase = createServiceRoleClient();
    const { data: donation, error: insertError } = await supabase
      .from("donations")
      .insert({
        first_name: firstName,
        last_name: lastName,
        child_name: childName,
        phone,
        email,
        address,
        door_code: doorCode || null,
        toy_description: toyDescription || null,
        toy_items: toyPayloads,
        toys_quality_confirmed: true,
        terms_accepted: true,
        pickup_weekday: slot.weekday,
        pickup_slot_id: slot.id,
        scheduled_slot: scheduledSlotLabel,
        pickup_notes: pickupNotes || null,
        scheduled_region: region,
        journey_type: journeyTypeRaw,
        payment_status: false,
        amount_paid: 0,
      })
      .select("id")
      .single();

    if (insertError || !donation?.id) {
      console.error(insertError);
      return NextResponse.json(
        { error: "לא ניתן לשמור את הבקשה כרגע. נסו שוב מאוחר יותר." },
        { status: 500 },
      );
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: email,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "ils",
            unit_amount: PICKUP_FEE_AGOROT,
            product_data: {
              name: `דמי שינוע ואיסוף: ₪${PICKUP_FEE_ILS}`,
              description:
                "כולל לוגיסטיקת איסוף ומכתב AI מותאם אישית לילד המקבל.",
            },
          },
        },
      ],
      success_url: `${origin}/pickup/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pickup/cancel`,
      metadata: {
        donation_id: donation.id,
      },
    });

    await supabase
      .from("donations")
      .update({ stripe_checkout_session_id: session.id })
      .eq("id", donation.id);

    if (!session.url) {
      return NextResponse.json({ error: "שגיאה ביצירת סשן תשלום" }, { status: 500 });
    }

    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error(e);
    const message =
      e instanceof Error && e.message.includes("SUPABASE_SERVICE_ROLE_KEY")
        ? "השרת לא מוגדר לשמירת תרומות (חסר מפתח שירות ל-Supabase)."
        : e instanceof Error && e.message.includes("STRIPE_SECRET_KEY")
          ? "תשלומים לא הוגדרו בשרת (חסר מפתח Stripe)."
          : "שגיאה פנימית. נסו שוב.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
