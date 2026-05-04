"use client";

import { DonationFormToyStep } from "@/components/public/donation-form-toy-step";
import { DonationFormBrandPanel } from "@/components/forms/donation/donation-form-brand-panel";
import type { ToyItemRow } from "@/lib/toy-donation";

type DonationDynamicToyListProps = {
  journeyType: string;
  childName: string;
  onChildNameChange: (value: string) => void;
  toyItems: ToyItemRow[];
  isPickup: boolean;
  claudeChrome?: boolean;
  showGlobalChildName?: boolean;
  showRequiredStars?: boolean;
  fieldLabelClass: string;
  sectionSubClass: string;
  inputClassName: string;
  onUpdateToy: (id: string, patch: Partial<Omit<ToyItemRow, "id">>) => void;
  onAddToy: () => void;
  onRemoveToy: (id: string) => void;
};

/** רשימת פריטי צעצועים דינמית בתוך מיכל מותג */
export function DonationDynamicToyList(props: DonationDynamicToyListProps) {
  return (
    <DonationFormBrandPanel>
      <DonationFormToyStep {...props} />
    </DonationFormBrandPanel>
  );
}
