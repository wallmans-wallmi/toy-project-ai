"use client";

import { useCallback, useState } from "react";
import type { DonationFormState } from "@/hooks/use-donation-form";
import {
  DONATION_PAYMENT_STATUS_PENDING,
  type CheckoutLeadCapturedApiPayload,
} from "@/lib/donation-journey";
import { formatPickupAddressLine } from "@/lib/format-pickup-address";
import { normalizedToyPayloads } from "@/lib/toy-donation";

export type CheckoutSuccessPayload = {
  /** מזהה התרומה ב־Supabase */
  id: string;
  payment_status: typeof DONATION_PAYMENT_STATUS_PENDING;
  /** שדות לא-רגישים ל־Mixpanel / Meta — ללא PII */
  lead: CheckoutLeadCapturedApiPayload["lead"];
};

export function useDonationCheckout() {
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [checkoutSuccess, setCheckoutSuccess] = useState<CheckoutSuccessPayload | null>(null);

  const clearCheckoutSuccess = useCallback(() => {
    setCheckoutSuccess(null);
  }, []);

  const runCheckout = useCallback(async (form: DonationFormState) => {
    setCheckoutError(null);
    setCheckoutSuccess(null);
    setCheckoutLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          childName: form.childName,
          journeyType: form.journeyType,
          phone: form.phone,
          email: form.email,
          address: formatPickupAddressLine(form),
          doorCode: form.doorCode,
          region: form.region,
          pickupCity: form.pickupCity.trim() || undefined,
          toyItems: normalizedToyPayloads(form.toyItems),
          toysQualityConfirmed: form.toysQualityConfirmed,
          termsAccepted: form.termsAccepted,
          pickupSlotId: form.pickupSlotId,
          pickupDate: form.pickupDate.trim(),
          pickupNotes: form.addressNotes.trim(),
        }),
      });
      const data = (await res.json()) as Partial<CheckoutLeadCapturedApiPayload> & {
        id?: string;
        error?: string;
      };
      const donationId = typeof data.donation_id === "string" ? data.donation_id : data.id;
      if (!res.ok || !data.success || !donationId || !data.lead_captured || !data.lead) {
        setCheckoutError(data.error ?? "לא הצלחנו לשמור את הבקשה נסו שוב");
        return;
      }
      setCheckoutSuccess({
        id: donationId,
        payment_status: data.payment_status ?? DONATION_PAYMENT_STATUS_PENDING,
        lead: data.lead,
      });
    } catch {
      setCheckoutError("בעיית רשת בדקו את החיבור ונסו שוב");
    } finally {
      setCheckoutLoading(false);
    }
  }, []);

  return { checkoutLoading, checkoutError, checkoutSuccess, clearCheckoutSuccess, runCheckout };
}
