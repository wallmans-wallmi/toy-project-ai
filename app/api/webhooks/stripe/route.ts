import { NextResponse } from "next/server";
import Stripe from "stripe";
import { PICKUP_FEE_ILS } from "@/lib/constants/pricing";
import { getStripe } from "@/lib/stripe/server";
import { createServiceRoleClient } from "@/lib/supabase/service";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("Missing STRIPE_WEBHOOK_SECRET");
    return NextResponse.json({ error: "לא מוגדר" }, { status: 500 });
  }

  const body = await req.text();
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "חסר חתימה" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "חתימה לא תקינה" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const donationId = session.metadata?.donation_id;
    if (!donationId) {
      console.error("checkout.session.completed without donation_id");
      return NextResponse.json({ received: true });
    }

    const paid =
      typeof session.amount_total === "number"
        ? Math.round(session.amount_total / 100)
        : PICKUP_FEE_ILS;

    try {
      const supabase = createServiceRoleClient();
      const { error } = await supabase
        .from("donations")
        .update({
          payment_status: true,
          amount_paid: paid,
          stripe_payment_intent_id:
            typeof session.payment_intent === "string"
              ? session.payment_intent
              : session.payment_intent?.id ?? null,
        })
        .eq("id", donationId);

      if (error) {
        console.error(error);
      }
    } catch (e) {
      console.error(e);
    }
  }

  return NextResponse.json({ received: true });
}
