import type { DonationFormState } from "@/hooks/use-donation-form";
import { isDonationJourneyId } from "@/lib/donation-journey";
import { donationItemsRowsComplete } from "@/lib/toy-donation";

export function emailOk(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export type DonationFormValidationOpts = {
  pickupSplitSteps?: boolean;
};

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
      return Boolean(form.childName.trim() && donationItemsRowsComplete(form.toyItems));
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
    return Boolean(form.childName.trim() && donationItemsRowsComplete(form.toyItems));
  }
  if (stepIndex === 4) {
    return form.toysQualityConfirmed === true && form.termsAccepted === true;
  }
  return true;
}
