import type Stripe from "stripe";

/**
 * מנסה להפיק כתובת קבלה/חשבונית מסשן Checkout (תשלום בודד).
 * עדיפות: receipt_url מה־charge של ה־PaymentIntent, אחר כך hosted_invoice_url אם יש חשבונית.
 */
export async function resolveCheckoutSessionInvoiceUrl(
  stripe: Stripe,
  session: Stripe.Checkout.Session,
): Promise<string | null> {
  try {
    const inv = session.invoice;
    if (inv && typeof inv === "object" && "hosted_invoice_url" in inv) {
      const url = (inv as Stripe.Invoice).hosted_invoice_url;
      if (typeof url === "string" && url.trim()) return url.trim();
    }
    if (typeof inv === "string" && inv) {
      const doc = await stripe.invoices.retrieve(inv);
      if (doc.hosted_invoice_url?.trim()) return doc.hosted_invoice_url.trim();
    }
  } catch {
    /* נמשיך ל־PaymentIntent */
  }

  const piRef = session.payment_intent;
  const piId = typeof piRef === "string" ? piRef : piRef?.id;
  if (!piId) return null;

  try {
    const pi = await stripe.paymentIntents.retrieve(piId, { expand: ["latest_charge"] });
    const lc = pi.latest_charge;
    if (lc && typeof lc !== "string") {
      const receipt = (lc as Stripe.Charge).receipt_url;
      if (typeof receipt === "string" && receipt.trim()) return receipt.trim();
    }
  } catch {
    return null;
  }

  return null;
}
