"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useDonationCheckout } from "@/hooks/use-donation-checkout";
import { useDonationForm, type UseDonationFormOpts } from "@/hooks/use-donation-form";
import { DONATION_DRAFT_STORAGE_KEY } from "@/lib/donation-draft-storage";

/**
 * איחוד טופס תרומה + תשלום: מצב שלבים, שדות, וקריאת checkout.
 * אחרי שלב הפרטים (המשך) נשמרת טיוטה ב־`donations` עם `funnel_stage` = potential.
 */
export function useDonationIntake(opts?: UseDonationFormOpts) {
  const flow = useDonationForm(opts);
  const checkout = useDonationCheckout();
  const [draftSaving, setDraftSaving] = useState(false);

  const stepRef = useRef(flow.stepIndex);
  const formRef = useRef(flow.form);
  const splitRef = useRef(flow.pickupSplitSteps);
  stepRef.current = flow.stepIndex;
  formRef.current = flow.form;
  splitRef.current = flow.pickupSplitSteps;

  const goNextWithDraft = useCallback(() => {
    void (async () => {
      if (stepRef.current === 1) {
        setDraftSaving(true);
        try {
          const existing =
            typeof window !== "undefined"
              ? window.sessionStorage.getItem(DONATION_DRAFT_STORAGE_KEY)?.trim() || undefined
              : undefined;
          const res = await fetch("/api/checkout/draft", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              donationId: existing,
              form: formRef.current,
              pickupSimplified: splitRef.current,
            }),
          });
          const data = (await res.json()) as { donation_id?: string };
          if (typeof window !== "undefined") {
            if (res.ok && data.donation_id) {
              window.sessionStorage.setItem(DONATION_DRAFT_STORAGE_KEY, data.donation_id);
            } else {
              window.sessionStorage.removeItem(DONATION_DRAFT_STORAGE_KEY);
            }
          }
        } finally {
          setDraftSaving(false);
        }
      }
      flow.goNext();
    })();
  }, [flow.goNext]);

  const flowForUi = useMemo(() => ({ ...flow, goNext: goNextWithDraft }), [flow, goNextWithDraft]);

  const onStartNewDonationForm = useCallback(() => {
    checkout.clearCheckoutSuccess();
    flow.resetFlow();
    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem(DONATION_DRAFT_STORAGE_KEY);
    }
  }, [checkout.clearCheckoutSuccess, flow.resetFlow]);

  const onRunCheckout = useCallback(() => {
    void checkout.runCheckout(flow.form, { pickupSimplified: flow.pickupSplitSteps });
  }, [checkout.runCheckout, flow.form, flow.pickupSplitSteps]);

  return {
    flow: flowForUi,
    draftSaving,
    checkoutLoading: checkout.checkoutLoading,
    checkoutError: checkout.checkoutError,
    checkoutSuccess: checkout.checkoutSuccess,
    onStartNewDonationForm,
    onRunCheckout,
  };
}
