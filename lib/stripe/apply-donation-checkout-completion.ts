import type Stripe from "stripe";
import { PICKUP_FEE_ILS } from "@/lib/constants/pricing";
import { DONATION_PAYMENT_STATUS_COMPLETED } from "@/lib/donation-checkout-lead";
import { scheduleDonationLetterAfterLeadCapture } from "@/lib/donation-letter";
import { resolveCheckoutSessionInvoiceUrl } from "@/lib/stripe/checkout-session-invoice-url";
import { createServiceRoleClient } from "@/lib/supabase/service";

/**
 * מעדכן תרומה אחרי סשן Checkout ששולם (אותה לוגיקה כמו webhook).
 * אידמפוטנטי: אפשר לקרוא שוב בלי לשבור.
 */
export async function applyDonationCheckoutCompletionFromStripeSession(
  stripe: Stripe,
  session: Stripe.Checkout.Session,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const donationId = session.metadata?.donation_id;
  if (!donationId) {
    return { ok: false, error: "חסר donation_id במטא־דאטה של הסשן" };
  }
  if (session.payment_status !== "paid") {
    return { ok: false, error: "התשלום עדיין לא מסומן כשולם בסשן" };
  }

  const paid =
    typeof session.amount_total === "number"
      ? Math.round(session.amount_total / 100)
      : PICKUP_FEE_ILS;

  try {
    const supabase = createServiceRoleClient();
    const invoiceUrl = await resolveCheckoutSessionInvoiceUrl(stripe, session);
    const patch: Record<string, unknown> = {
      payment_status: DONATION_PAYMENT_STATUS_COMPLETED,
      amount_paid: paid,
      stripe_payment_intent_id:
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.payment_intent?.id ?? null,
    };
    if (invoiceUrl) {
      patch.invoice_url = invoiceUrl;
    }

    const { error } = await supabase.from("donations").update(patch).eq("id", donationId);
    if (error) {
      console.error("[applyDonationCheckoutCompletion]", error);
      return { ok: false, error: error.message };
    }
    scheduleDonationLetterAfterLeadCapture(donationId);
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "שגיאת שרת" };
  }
}
