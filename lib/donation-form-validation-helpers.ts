import type { DonationFormState } from "@/hooks/use-donation-form";
import { journeyItemsStepValid } from "@/lib/donation-form-zod";
import { activePackingChildNames, packingKitsStepValid } from "@/lib/donation-packing-kits";

export function emailOk(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function displayPrimaryChildName(form: DonationFormState): string {
  const packing = activePackingChildNames(form)[0]?.trim();
  if (packing) return packing;
  const fromItem = form.toyItems.find((t) => t.itemChildName.trim())?.itemChildName.trim();
  if (fromItem) return fromItem;
  return form.childName.trim();
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
      return packingKitsStepValid(form);
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
    return packingKitsStepValid(form);
  }
  if (stepIndex === 1) {
    return Boolean(
      form.firstName.trim() &&
        form.lastName.trim() &&
        form.phone.trim() &&
        emailOk(form.email) &&
        form.pickupCity.trim() &&
        form.streetName.trim() &&
        form.houseNumber.trim(),
    );
  }
  if (stepIndex === 2) {
    return form.termsAccepted === true;
  }
  return true;
}
