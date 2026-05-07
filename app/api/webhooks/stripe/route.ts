import { NextResponse } from "next/server";
import Stripe from "stripe";
import { applyDonationCheckoutCompletionFromStripeSession } from "@/lib/stripe/apply-donation-checkout-completion";
import { getStripe } from "@/lib/stripe/server";

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

  const stripe = getStripe();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "חתימה לא תקינה" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    if (!session.metadata?.donation_id) {
      console.error("checkout.session.completed without donation_id");
      return NextResponse.json({ received: true });
    }
    const result = await applyDonationCheckoutCompletionFromStripeSession(stripe, session);
    if (!result.ok) {
      console.error("[stripe webhook]", result.error);
    }
  }

  return NextResponse.json({ received: true });
}
