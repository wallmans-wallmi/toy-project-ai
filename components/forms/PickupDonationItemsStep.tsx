"use client";

import { DonationFormJourneyFields } from "@/components/public/donation-form-journey-fields";
import type { DonationFormState } from "@/hooks/use-donation-form";

type FieldUpdater = <K extends keyof DonationFormState>(key: K, value: DonationFormState[K]) => void;

export type PickupDonationItemsStepProps = {
  form: DonationFormState;
  fieldLabelClass: string;
  sectionSubClass: string;
  inputClassName: string;
  updateField: FieldUpdater;
  updateToyItem: (id: string, patch: Partial<Omit<DonationFormState["toyItems"][number], "id">>) => void;
  addToyItem: () => void;
  removeToyItem: (id: string) => void;
};

/** שלב הפריטים במסלול איסוף — שדות דינמיים לפי קטגוריה (כולל שם ילד כאן בלבד) */
export function PickupDonationItemsStep(props: PickupDonationItemsStepProps) {
  return (
    <DonationFormJourneyFields
      form={props.form}
      isPickup
      fieldLabelClass={props.fieldLabelClass}
      sectionSubClass={props.sectionSubClass}
      inputClassName={props.inputClassName}
      updateField={props.updateField}
      updateToyItem={props.updateToyItem}
      addToyItem={props.addToyItem}
      removeToyItem={props.removeToyItem}
    />
  );
}
