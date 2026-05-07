"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { DonationJourneyId } from "@/lib/donation-journey";
import {
  clampPackingExtraBagCount,
  createEmptyPackingChildNames,
  createEmptyPackingExtraBags,
  defaultDeferredPickupSchedulingFields,
  type PackingChildCount,
  type PackingChildNamesTuple,
  type PackingExtraBagsTuple,
} from "@/lib/donation-packing-kits";
import { createEmptyToyItem, type ToyItemRow } from "@/lib/toy-donation";

export const DONATION_STEP_LABELS = [
  "ערכות אריזה וילדים",
  "חשבון וכתובת למשלוח",
  "פרטי הצעצועים",
  "סיכום",
  "תשלום",
] as const;

export const DONATION_PICKUP_SPLIT_STEP_LABELS = [
  "ערכות אריזה לפי ילדים",
  "פרטים וכתובת",
  "סיכום",
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
  journeyType: DonationJourneyId;
  pickupCity: string;
  region: string;
  toyItems: ToyItemRow[];
  toysQualityConfirmed: boolean;
  childName: string;
  pickupSlotId: string | null;
  pickupDate: string;
  termsAccepted: boolean;
  childCount: PackingChildCount;
  packingChildNames: PackingChildNamesTuple;
  /** שקיות אריזה נוספות לכל ילד או ילדה (מעבר לשקית הכלולה) */
  packingExtraBags: PackingExtraBagsTuple;
};

export type UseDonationFormOpts = {
  pickupSplitSteps?: boolean;
  initialJourneyType?: DonationJourneyId;
};

function initialFormState(initialJourney?: DonationJourneyId): DonationFormState {
  const journeyType: DonationJourneyId = initialJourney ?? "toy_dropoff";
  const deferred = defaultDeferredPickupSchedulingFields();
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
    journeyType,
    pickupCity: "",
    region: deferred.region,
    toyItems: [createEmptyToyItem()],
    toysQualityConfirmed: false,
    childName: "",
    pickupSlotId: deferred.pickupSlotId,
    pickupDate: deferred.pickupDate,
    termsAccepted: false,
    childCount: 1,
    packingChildNames: createEmptyPackingChildNames(),
    packingExtraBags: createEmptyPackingExtraBags(),
  };
}

/** מצב טופס מינימלי לתיאום איסוף בפורטל (אזור, חלון, תאריך, אישורים) */
export function createEmptyDonationFormStateForPortalPickup(): DonationFormState {
  const journeyType: DonationJourneyId = "toy_dropoff";
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
    journeyType,
    pickupCity: "",
    region: "",
    toyItems: [createEmptyToyItem()],
    toysQualityConfirmed: false,
    childName: "",
    pickupSlotId: null,
    pickupDate: "",
    termsAccepted: false,
    childCount: 1,
    packingChildNames: createEmptyPackingChildNames(),
    packingExtraBags: createEmptyPackingExtraBags(),
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

  useEffect(() => {
    const j = opts?.initialJourneyType;
    if (!j) return;
    setForm((prev) => (prev.journeyType === j ? prev : { ...prev, journeyType: j }));
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

  const updateField = useCallback(<K extends keyof DonationFormState>(key: K, value: DonationFormState[K]) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "region") {
        next.pickupSlotId = null;
        next.pickupDate = "";
      }
      return next;
    });
  }, []);

  const updateChildCount = useCallback((count: PackingChildCount) => {
    setForm((prev) => {
      const nextBags = createEmptyPackingExtraBags();
      for (let i = 0; i < count; i += 1) {
        nextBags[i] = clampPackingExtraBagCount(prev.packingExtraBags[i] ?? 0);
      }
      return { ...prev, childCount: count, packingExtraBags: nextBags };
    });
  }, []);

  const updatePackingChildName = useCallback((index: number, value: string) => {
    if (index < 0 || index > 3) return;
    setForm((prev) => {
      const next: PackingChildNamesTuple = [...prev.packingChildNames] as PackingChildNamesTuple;
      next[index] = value;
      return { ...prev, packingChildNames: next };
    });
  }, []);

  const updatePackingExtraBag = useCallback((index: number, value: number) => {
    if (index < 0 || index > 3) return;
    setForm((prev) => {
      const next = [...prev.packingExtraBags] as PackingExtraBagsTuple;
      next[index] = clampPackingExtraBagCount(value);
      return { ...prev, packingExtraBags: next };
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

  const isSummaryStep = pickupSplitSteps ? stepIndex === 2 : stepIndex === 3;
  const isPaymentStep = pickupSplitSteps ? stepIndex === 3 : stepIndex === 4;

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
    updateChildCount,
    updatePackingChildName,
    updatePackingExtraBag,
    updateToyItem,
    addToyItem,
    removeToyItem,
    goNext,
    goBack,
    goToStep,
    resetFlow,
  };
}
