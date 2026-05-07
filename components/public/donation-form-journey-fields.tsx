"use client";

import { DonationDynamicToyList } from "@/components/forms/donation/donation-dynamic-toy-list";
import type { DonationFormState } from "@/hooks/use-donation-form";
import { cn } from "@/lib/utils";

type JourneyFieldsProps = {
  form: DonationFormState;
  isPickup: boolean;
  fieldLabelClass: string;
  sectionSubClass: string;
  inputClassName: string;
  updateField: <K extends keyof DonationFormState>(key: K, value: DonationFormState[K]) => void;
  updateToyItem: (id: string, patch: Partial<Omit<DonationFormState["toyItems"][number], "id">>) => void;
  addToyItem: () => void;
  removeToyItem: (id: string) => void;
};

export function DonationFormJourneyFields({
  form,
  isPickup,
  fieldLabelClass,
  sectionSubClass,
  inputClassName,
  updateField,
  updateToyItem,
  addToyItem,
  removeToyItem,
}: JourneyFieldsProps) {
  return (
    <div className="animate-donation-journey-panel motion-reduce:animate-none" dir="rtl" lang="he">
      <DonationDynamicToyList
        journeyType={form.journeyType}
        childName={form.childName}
        onChildNameChange={(v) => updateField("childName", v)}
        toyItems={form.toyItems}
        isPickup={isPickup}
        claudeChrome={isPickup}
        showRequiredStars
        showGlobalChildName={false}
        fieldLabelClass={fieldLabelClass}
        sectionSubClass={cn(sectionSubClass)}
        inputClassName={inputClassName}
        onUpdateToy={updateToyItem}
        onAddToy={addToyItem}
        onRemoveToy={removeToyItem}
      />
    </div>
  );
}
