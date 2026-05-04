"use client";

import { DonationFormBrandPanel } from "@/components/forms/donation/donation-form-brand-panel";
import { DonationDynamicToyList } from "@/components/forms/donation/donation-dynamic-toy-list";
import { DonationFormulaNotice } from "@/components/forms/donation/donation-formula-notice";
import { DonationQuantityField } from "@/components/forms/donation/donation-quantity-field";
import {
  DonationSegmentedChoice,
  type DonationSegmentedOption,
} from "@/components/forms/donation/donation-segmented-choice";
import { RequiredFieldStar } from "@/components/public/donation-form-progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { DonationFormState } from "@/hooks/use-donation-form";
import { isToyDropoffJourney } from "@/lib/donation-journey";
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

const BOTTLE_OPTIONS: readonly DonationSegmentedOption<"bottles" | "formula">[] = [
  { value: "bottles", label: "בקבוקים" },
  { value: "formula", label: "פורמולה" },
];

const DIAPER_OPTIONS: readonly DonationSegmentedOption<"closed" | "loose" | "both">[] = [
  { value: "closed", label: "חבילה סגורה" },
  { value: "loose", label: "פריטים פתוחים או מפוזרים" },
  { value: "both", label: "גם וגם" },
];

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
  const j = form.journeyType;

  if (!j) {
    return (
      <p className={cn(sectionSubClass, "px-4 text-center sm:text-start")} dir="rtl" lang="he">
        נא לבחור קודם את סוג המשימה בשלב הקודם.
      </p>
    );
  }

  return (
    <div
      key={j}
      className="animate-donation-journey-panel motion-reduce:animate-none"
      dir="rtl"
      lang="he"
    >
      {isToyDropoffJourney(j) ? (
        <DonationDynamicToyList
          journeyType={j}
          childName={form.childName}
          onChildNameChange={(v) => updateField("childName", v)}
          toyItems={form.toyItems}
          isPickup={isPickup}
          claudeChrome={isPickup}
          showRequiredStars
          showGlobalChildName={false}
          fieldLabelClass={fieldLabelClass}
          sectionSubClass={sectionSubClass}
          inputClassName={inputClassName}
          onUpdateToy={updateToyItem}
          onAddToy={addToyItem}
          onRemoveToy={removeToyItem}
        />
      ) : null}

      {j === "pacifier_weaning" ? (
        <DonationFormBrandPanel>
          <div className="space-y-5">
            <div className={cn("space-y-2", isPickup && "field-group")}>
              <Label htmlFor="wean-child-paci" className={fieldLabelClass}>
                שם הילד או הילדה
                <RequiredFieldStar />
              </Label>
              <Input
                id="wean-child-paci"
                className={cn(inputClassName, isPickup && "pickup-native-field")}
                value={form.childName}
                onChange={(e) => updateField("childName", e.target.value)}
                placeholder="למשל אורי"
                autoComplete="name"
                aria-required="true"
              />
            </div>
            <DonationQuantityField
              id="paci-qty"
              label="כמות מוצצים לאיסוף"
              value={form.pacifierQuantity}
              onChange={(v) => updateField("pacifierQuantity", v)}
              hint="מספר שלם, בערך כמה פריטים נכנסים לשקית"
              fieldLabelClass={fieldLabelClass}
              sectionSubClass={sectionSubClass}
              inputClassName={inputClassName}
              isPickup={isPickup}
              required
            />
          </div>
        </DonationFormBrandPanel>
      ) : null}

      {j === "bottle_weaning" ? (
        <DonationFormBrandPanel>
          <div className="space-y-5">
            <div className={cn("space-y-2", isPickup && "field-group")}>
              <Label htmlFor="wean-child-bottle" className={fieldLabelClass}>
                שם הילד או הילדה
                <RequiredFieldStar />
              </Label>
              <Input
                id="wean-child-bottle"
                className={cn(inputClassName, isPickup && "pickup-native-field")}
                value={form.childName}
                onChange={(e) => updateField("childName", e.target.value)}
                placeholder="למשל נועם"
                autoComplete="name"
                aria-required="true"
              />
            </div>
            <DonationSegmentedChoice
              name="bottle-sub"
              legend="מה נפרדים ממנו?"
              options={BOTTLE_OPTIONS}
              value={form.bottleSubChoice}
              onChange={(next) => updateField("bottleSubChoice", next)}
              fieldLabelClass={fieldLabelClass}
              required
            />
            {form.bottleSubChoice === "formula" ? <DonationFormulaNotice className="mt-1" /> : null}
          </div>
        </DonationFormBrandPanel>
      ) : null}

      {j === "diaper_weaning" ? (
        <DonationFormBrandPanel>
          <div className="space-y-5">
            <div className={cn("space-y-2", isPickup && "field-group")}>
              <Label htmlFor="wean-child-diaper" className={fieldLabelClass}>
                שם הילד או הילדה
                <RequiredFieldStar />
              </Label>
              <Input
                id="wean-child-diaper"
                className={cn(inputClassName, isPickup && "pickup-native-field")}
                value={form.childName}
                onChange={(e) => updateField("childName", e.target.value)}
                placeholder="למשל שירה"
                autoComplete="name"
                aria-required="true"
              />
            </div>
            <DonationSegmentedChoice
              name="diaper-pkg"
              legend="איך החיתולים מגיעים?"
              options={DIAPER_OPTIONS}
              value={form.diaperPackageType}
              onChange={(next) => updateField("diaperPackageType", next)}
              fieldLabelClass={fieldLabelClass}
              required
            />
          </div>
        </DonationFormBrandPanel>
      ) : null}
    </div>
  );
}
