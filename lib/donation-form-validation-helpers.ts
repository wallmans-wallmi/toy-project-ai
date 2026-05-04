import type { DonationFormState } from "@/hooks/use-donation-form";
import { journeyItemsStepValid } from "@/lib/donation-form-zod";
import { isDonationJourneyId, isToyDropoffJourney } from "@/lib/donation-journey";

export function emailOk(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/** שם לתצוגה / מסך הצלחה — במסלול צעצועים מעדיף שם לפי פריט */
export function displayPrimaryChildName(form: DonationFormState): string {
  if (isToyDropoffJourney(form.journeyType)) {
    const fromItem = form.toyItems.find((t) => t.itemChildName.trim())?.itemChildName.trim();
    if (fromItem) return fromItem;
  }
  return form.childName.trim();
}

export type DonationFormValidationOpts = {
  pickupSplitSteps?: boolean;
};

/**
 * תנאי לחיצה על "המשך" לפי שלב.
 * מסלול איסוף מפוצל: בשלב הקטגוריה — רק בחירת מסלול (שם ילד בשלב הפריטים).
 */
export function canAdvanceToNextStep(
  stepIndex: number,
  form: DonationFormState,
  opts?: DonationFormValidationOpts,
): boolean {
  const split = opts?.pickupSplitSteps === true;

  if (!split) {
    if (stepIndex === 0) {
      return Boolean(
        isDonationJourneyId(form.journeyType) && form.region && form.pickupSlotId,
      );
    }
    if (stepIndex === 1) {
      return Boolean(
        form.firstName.trim() &&
          form.lastName.trim() &&
          form.phone.trim() &&
          emailOk(form.email) &&
          form.streetName.trim() &&
          form.houseNumber.trim(),
      );
    }
    if (stepIndex === 2) {
      return journeyItemsStepValid(form);
    }
    if (stepIndex === 3) {
      return form.toysQualityConfirmed === true && form.termsAccepted === true;
    }
    return true;
  }

  if (stepIndex === 0) {
    return isDonationJourneyId(form.journeyType);
  }
  if (stepIndex === 1) {
    return Boolean(form.region && form.pickupSlotId && form.pickupDate.trim());
  }
  if (stepIndex === 2) {
    return Boolean(
      form.firstName.trim() &&
        form.lastName.trim() &&
        form.phone.trim() &&
        emailOk(form.email) &&
        form.streetName.trim() &&
        form.houseNumber.trim(),
    );
  }
  if (stepIndex === 3) {
    return journeyItemsStepValid(form);
  }
  if (stepIndex === 4) {
    return form.toysQualityConfirmed === true && form.termsAccepted === true;
  }
  return true;
}
