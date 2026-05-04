"use client";

import { RequiredFieldStar } from "@/components/public/donation-form-progress";
import type { DonationFormState } from "@/hooks/use-donation-form";
import {
  DONATION_JOURNEY_EMOJI,
  DONATION_JOURNEY_OPTIONS,
  type DonationJourneyId,
} from "@/lib/donation-journey";
import { cn } from "@/lib/utils";

type FieldUpdater = <K extends keyof DonationFormState>(key: K, value: DonationFormState[K]) => void;

type PickupJourneyCategoryStepProps = {
  form: DonationFormState;
  updateField: FieldUpdater;
};

/** שלב הקטגוריה במסלול איסוף — בחירת מסלול בלבד */
export function PickupJourneyCategoryStep({ form, updateField }: PickupJourneyCategoryStepProps) {
  return (
    <>
      <p className="cat-fields-title">
        בוחרים קטגוריה אחת
        <RequiredFieldStar />
      </p>
      <div className="cat-grid">
        {DONATION_JOURNEY_OPTIONS.map((opt) => {
          const selected = form.journeyType === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              className={cn("cat-btn", selected && "selected")}
              aria-pressed={selected}
              onClick={() => updateField("journeyType", opt.id as DonationJourneyId)}
            >
              <span className="cat-icon" aria-hidden>
                {DONATION_JOURNEY_EMOJI[opt.id]}
              </span>
              <span className="cat-label">{opt.label}</span>
            </button>
          );
        })}
      </div>
    </>
  );
}
