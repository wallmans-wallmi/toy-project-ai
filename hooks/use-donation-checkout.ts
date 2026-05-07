"use client";

import { useCallback, useState } from "react";
import type { DonationFormState } from "@/hooks/use-donation-form";
import {
  buildCheckoutToyItemsJson,
  buildSyntheticToyPayloadFromPackingForPickup,
  mergePackingExtraBagsIntoToyPayloads,
  type CheckoutItemsFormInput,
  type DonationToyItemToy,
} from "@/lib/donation-checkout-items";
import {
  DONATION_PAYMENT_STATUS_PENDING,
  type CheckoutLeadCapturedApiPayload,
} from "@/lib/donation-checkout-lead";
import { DONATION_DRAFT_STORAGE_KEY } from "@/lib/donation-draft-storage";
import { formatPickupAddressLine } from "@/lib/format-pickup-address";
import { joinPackingChildNamesForChildField } from "@/lib/donation-packing-kits";

export type CheckoutSuccessPayload = {
  id: string;
  order_number: number | null;
  payment_status: typeof DONATION_PAYMENT_STATUS_PENDING;
  lead: CheckoutLeadCapturedApiPayload["lead"];
};

export type RunCheckoutOpts = {
  /** טופס איסוף מקוצר בלי שלב פריטים: משלימים פריטי JSON סינתטיים לפי שמות האריזה */
  pickupSimplified?: boolean;
};

function checkoutItemsInput(form: DonationFormState): CheckoutItemsFormInput {
  return {
    journeyType: form.journeyType,
    childName: form.childName,
    toyItems: form.toyItems,
  };
}

function resolveChildNameForApi(form: DonationFormState): string {
  const fromPacking = joinPackingChildNamesForChildField(form).trim();
  if (fromPacking) return fromPacking;
  const fromItem = form.toyItems.find((t) => t.itemChildName.trim())?.itemChildName.trim();
  return (fromItem || form.childName).trim();
}

export function useDonationCheckout() {
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [checkoutSuccess, setCheckoutSuccess] = useState<CheckoutSuccessPayload | null>(null);

  const clearCheckoutSuccess = useCallback(() => {
    setCheckoutSuccess(null);
  }, []);

  const runCheckout = useCallback(async (form: DonationFormState, opts?: RunCheckoutOpts) => {
    setCheckoutError(null);
    setCheckoutSuccess(null);
    setCheckoutLoading(true);
    try {
      const itemsInput = checkoutItemsInput(form);
      let toyItems: unknown[] = buildCheckoutToyItemsJson(itemsInput);
      if (toyItems.length === 0 && opts?.pickupSimplified === true) {
        toyItems = buildSyntheticToyPayloadFromPackingForPickup(form);
      } else if (toyItems.length > 0) {
        toyItems = mergePackingExtraBagsIntoToyPayloads(toyItems as DonationToyItemToy[], form);
      }
      const childName = resolveChildNameForApi(form);
      const upgradeDonationId =
        typeof window !== "undefined"
          ? window.sessionStorage.getItem(DONATION_DRAFT_STORAGE_KEY)?.trim() || undefined
          : undefined;

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          upgradeDonationId,
          firstName: form.firstName,
          lastName: form.lastName,
          childName,
          journeyType: form.journeyType,
          phone: form.phone,
          accountPhoneKey: form.phone.trim(),
          email: form.email,
          address: formatPickupAddressLine(form),
          streetName: form.streetName,
          houseNumber: form.houseNumber,
          apartmentNumber: form.apartmentNumber,
          floor: form.floor,
          doorCode: form.doorCode,
          region: form.region,
          pickupCity: form.pickupCity.trim() || undefined,
          toyItems,
          toysQualityConfirmed: opts?.pickupSimplified === true ? true : form.toysQualityConfirmed,
          termsAccepted: form.termsAccepted,
          pickupSlotId: form.pickupSlotId,
          pickupDate: form.pickupDate.trim(),
          addressNotes: form.addressNotes.trim(),
          packingChildCount: form.childCount,
          packingChildNames: form.packingChildNames.slice(0, form.childCount),
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
      const ord =
        typeof data.order_number === "number" && Number.isFinite(data.order_number)
          ? Math.trunc(data.order_number)
          : typeof data.lead.order_number === "number" && Number.isFinite(data.lead.order_number)
            ? Math.trunc(data.lead.order_number)
            : null;
      setCheckoutSuccess({
        id: donationId,
        order_number: ord,
        payment_status: data.payment_status ?? DONATION_PAYMENT_STATUS_PENDING,
        lead: data.lead,
      });
      if (typeof window !== "undefined") {
        window.sessionStorage.removeItem(DONATION_DRAFT_STORAGE_KEY);
      }
    } catch {
      setCheckoutError("בעיית רשת בדקו את החיבור ונסו שוב");
    } finally {
      setCheckoutLoading(false);
    }
  }, []);

  return { checkoutLoading, checkoutError, checkoutSuccess, clearCheckoutSuccess, runCheckout };
}
