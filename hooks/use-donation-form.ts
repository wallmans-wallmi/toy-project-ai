"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { DonationJourneyId } from "@/lib/donation-journey";
import { isDonationJourneyId } from "@/lib/donation-journey";
import { createEmptyToyItem, type ToyItemRow } from "@/lib/toy-donation";

export const DONATION_STEP_LABELS = [
  "מיקום וזמן איסוף",
  "פרטי קשר וכתובת",
  "פרטי הפריטים",
  "סיכום",
  "תשלום",
] as const;

export const DONATION_PICKUP_SPLIT_STEP_LABELS = [
  "ממה נפרדים?",
  "איזור וזמן איסוף",
  "פרטי קשר וכתובת",
  "פרטי הפריטים",
  "סיכום הבקשה",
  "תשלום",
] as const;

export type DonationFormState = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  streetName: string;
  houseNumber: string;
  apartmentNumber: string;
  floor: string;
  doorCode: string;
  addressNotes: string;
  journeyType: DonationJourneyId | "";
  pickupCity: string;
  region: string;
  toyItems: ToyItemRow[];
  toysQualityConfirmed: boolean;
  childName: string;
  pickupSlotId: string | null;
  pickupDate: string;
  termsAccepted: boolean;
  pacifierQuantity: string;
  bottleSubChoice: "" | "bottles" | "formula";
  diaperPackageType: "" | "closed" | "loose" | "both";
};

export type UseDonationFormOpts = {
  pickupSplitSteps?: boolean;
  /** מ־URL (?journey=) או מהורה הבית */
  initialJourneyType?: DonationJourneyId;
};

function initialFormState(initialJourney?: DonationJourneyId): DonationFormState {
  const j =
    initialJourney && isDonationJourneyId(initialJourney) ? initialJourney : ("" as const);
  return {
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    streetName: "",
    houseNumber: "",
    apartmentNumber: "",
    floor: "",
    doorCode: "",
    addressNotes: "",
    journeyType: j,
    pickupCity: "",
    region: "",
    toyItems: [createEmptyToyItem()],
    toysQualityConfirmed: false,
    childName: "",
    pickupSlotId: null,
    pickupDate: "",
    termsAccepted: false,
    pacifierQuantity: "",
    bottleSubChoice: "",
    diaperPackageType: "",
  };
}

export function useDonationForm(opts?: UseDonationFormOpts) {
  const pickupSplitSteps = opts?.pickupSplitSteps === true;
  const stepLabels = pickupSplitSteps ? DONATION_PICKUP_SPLIT_STEP_LABELS : DONATION_STEP_LABELS;
  const stepCount = stepLabels.length;

  const [stepIndex, setStepIndex] = useState(0);
  const [maxStepReached, setMaxStepReached] = useState(0);
  const [form, setForm] = useState(() => initialFormState(opts?.initialJourneyType));

  useEffect(() => {
    setMaxStepReached((m) => Math.max(m, stepIndex));
  }, [stepIndex]);

  /** סנכרון מסלול מ־URL (?journey=) אחרי טעינה / ניווט */
  useEffect(() => {
    const j = opts?.initialJourneyType;
    if (!j || !isDonationJourneyId(j)) return;
    setForm((prev) => {
      if (prev.journeyType === j) return prev;
      return {
        ...prev,
        journeyType: j,
        childName: "",
        pacifierQuantity: "",
        bottleSubChoice: "",
        diaperPackageType: "",
        toyItems: [createEmptyToyItem()],
        toysQualityConfirmed: false,
      };
    });
  }, [opts?.initialJourneyType]);

  const stepTitle = useMemo(
    () => `שלב ${stepIndex + 1}: ${stepLabels[stepIndex]}`,
    [stepIndex, stepLabels],
  );

  const goNext = useCallback(() => {
    setStepIndex((i) => Math.min(i + 1, stepCount - 1));
  }, [stepCount]);

  const goBack = useCallback(() => {
    setStepIndex((i) => Math.max(i - 1, 0));
  }, []);

  const goToStep = useCallback(
    (targetIndex: number) => {
      if (targetIndex < 0 || targetIndex >= stepCount) return;
      if (targetIndex > maxStepReached) return;
      setStepIndex(targetIndex);
    },
    [stepCount, maxStepReached],
  );

  const updateField = useCallback(<K extends keyof DonationFormState>(
    key: K,
    value: DonationFormState[K],
  ) => {
    setForm((prev) => {
      if (key === "journeyType") {
        const v = value as DonationFormState["journeyType"];
        return {
          ...prev,
          journeyType: v,
          childName: "",
          pacifierQuantity: "",
          bottleSubChoice: "",
          diaperPackageType: "",
          toyItems: [createEmptyToyItem()],
          toysQualityConfirmed: false,
        };
      }
      const next = { ...prev, [key]: value };
      if (key === "region") {
        next.pickupSlotId = null;
        next.pickupDate = "";
      }
      return next;
    });
  }, []);

  const updateToyItem = useCallback((id: string, patch: Partial<Omit<ToyItemRow, "id">>) => {
    setForm((prev) => ({
      ...prev,
      toyItems: prev.toyItems.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    }));
  }, []);

  const addToyItem = useCallback(() => {
    setForm((prev) => ({
      ...prev,
      toyItems: [...prev.toyItems, createEmptyToyItem()],
    }));
  }, []);

  const removeToyItem = useCallback((id: string) => {
    setForm((prev) => {
      if (prev.toyItems.length <= 1) return prev;
      return { ...prev, toyItems: prev.toyItems.filter((t) => t.id !== id) };
    });
  }, []);

  const resetFlow = useCallback(() => {
    setStepIndex(0);
    setMaxStepReached(0);
    setForm(initialFormState(opts?.initialJourneyType));
  }, [opts?.initialJourneyType]);

  const isSummaryStep = pickupSplitSteps ? stepIndex === 4 : stepIndex === 3;
  const isPaymentStep = pickupSplitSteps ? stepIndex === 5 : stepIndex === 4;

  return {
    stepIndex,
    stepCount,
    maxStepReached,
    stepTitle,
    stepLabel: stepLabels[stepIndex],
    pickupSplitSteps,
    isFirst: stepIndex === 0,
    isSummaryStep,
    isPaymentStep,
    form,
    updateField,
    updateToyItem,
    addToyItem,
    removeToyItem,
    goNext,
    goBack,
    goToStep,
    resetFlow,
  };
}
