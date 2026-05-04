"use client";

import { useCallback, useState } from "react";
import type { DonationFormState } from "@/hooks/use-donation-form";
import { formatPickupAddressLine } from "@/lib/format-pickup-address";
import { normalizedToyPayloads } from "@/lib/toy-donation";

export function useDonationCheckout() {
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const runCheckout = useCallback(async (form: DonationFormState) => {
    setCheckoutError(null);
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
          toyItems: normalizedToyPayloads(form.toyItems),
          toysQualityConfirmed: form.toysQualityConfirmed,
          termsAccepted: form.termsAccepted,
          pickupSlotId: form.pickupSlotId,
          pickupDate: form.pickupDate.trim(),
          pickupNotes: form.addressNotes.trim(),
        }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setCheckoutError(data.error ?? "לא הצלחנו להפנות לתשלום נסו שוב");
        return;
      }
      window.location.href = data.url;
    } catch {
      setCheckoutError("בעיית רשת בדקו את החיבור ונסו שוב");
    } finally {
      setCheckoutLoading(false);
    }
  }, []);

  return { checkoutLoading, checkoutError, runCheckout };
}
