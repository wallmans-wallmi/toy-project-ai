import type { DonationFormState } from "@/hooks/use-donation-form";
import { PICKUP_FEE_LABEL } from "@/lib/constants/pricing";
import {
  summaryLinesFromFormInput,
  type CheckoutItemsFormInput,
} from "@/lib/donation-checkout-items";
import { displayPrimaryChildName } from "@/components/public/donation-form-validation";
import { getDonationJourneyLabel, isDonationJourneyId } from "@/lib/donation-journey";
import { formatPickupAddressLine } from "@/lib/format-pickup-address";
import type { PickupTimeSlot } from "@/lib/pickup-regions";
import { formatPickupTimeSummaryLine } from "@/lib/pickup-schedule-slots";

type DonationFormSummaryProps = {
  form: DonationFormState;
  regionLabel: string | undefined;
  selectedSlot: PickupTimeSlot | undefined;
  /** עיצוב כרטיס סיכום מ־HTML v2 */
  variant?: "default" | "claude";
};

function dashOr(value: string | undefined | null): string {
  const v = value?.trim();
  return v ? v : "לא צוין";
}

function checkoutInput(form: DonationFormState): CheckoutItemsFormInput | null {
  if (!isDonationJourneyId(form.journeyType)) return null;
  return {
    journeyType: form.journeyType,
    childName: form.childName,
    toyItems: form.toyItems,
    pacifierQuantity: form.pacifierQuantity,
    bottleSubChoice: form.bottleSubChoice,
    diaperPackageType: form.diaperPackageType,
  };
}

export function DonationFormSummary({
  form,
  regionLabel,
  selectedSlot,
  variant = "default",
}: DonationFormSummaryProps) {
  const itemsInput = checkoutInput(form);
  const itemLines = itemsInput ? summaryLinesFromFormInput(itemsInput) : [];
  const displayChildName = displayPrimaryChildName(form);
  const addressLine = formatPickupAddressLine(form);
  const pickupTimeLine =
    formatPickupTimeSummaryLine(form.pickupDate, form.pickupSlotId, selectedSlot?.label ?? "") ||
    selectedSlot?.label?.trim() ||
    "";

  const itemsList =
    itemLines.length === 0 ? (
      dashOr("")
    ) : (
      <ul className="m-0 list-none space-y-2 p-0 text-start">
        {itemLines.map((line, i) => (
          <li key={`${line}-${i}`} className="leading-snug text-[var(--text)]">
            {line}
          </li>
        ))}
      </ul>
    );

  if (variant === "claude") {
    return (
      <div className="summary-card" dir="rtl">
        {form.pickupCity.trim() ? (
          <div className="summary-row">
            <span className="summary-key">עיר</span>
            <span className="summary-val">{dashOr(form.pickupCity)}</span>
          </div>
        ) : null}
        <div className="summary-row">
          <span className="summary-key">אזור איסוף</span>
          <span className="summary-val">{dashOr(regionLabel)}</span>
        </div>
        <div className="summary-row">
          <span className="summary-key">זמן לאיסוף</span>
          <span className="summary-val text-start leading-snug">{dashOr(pickupTimeLine)}</span>
        </div>
        <div className="summary-row">
          <span className="summary-key">המשימה שלכם</span>
          <span className="summary-val text-start leading-snug">{dashOr(getDonationJourneyLabel(form.journeyType))}</span>
        </div>
        <div className="summary-row">
          <span className="summary-key">שם מלא</span>
          <span className="summary-val">{dashOr(`${form.firstName} ${form.lastName}`.trim())}</span>
        </div>
        <div className="summary-row">
          <span className="summary-key">טלפון</span>
          <span className="summary-val" dir="ltr">
            {dashOr(form.phone)}
          </span>
        </div>
        <div className="summary-row">
          <span className="summary-key">מייל</span>
          <span className="summary-val truncate" dir="ltr">
            {dashOr(form.email)}
          </span>
        </div>
        <div className="summary-row">
          <span className="summary-key">כתובת לאיסוף</span>
          <span className="summary-val text-start leading-snug">{dashOr(addressLine)}</span>
        </div>
        <div className="summary-row">
          <span className="summary-key">קוד כניסה</span>
          <span className="summary-val" dir="ltr">
            {dashOr(form.doorCode)}
          </span>
        </div>
        <div className="summary-row">
          <span className="summary-key">הערות לכתובת</span>
          <span className="summary-val text-start">{dashOr(form.addressNotes)}</span>
        </div>
        <div className="summary-row">
          <span className="summary-key">שם הילד או הילדה</span>
          <span className="summary-val">{dashOr(displayChildName)}</span>
        </div>
        <div className="summary-row">
          <span className="summary-key">פריטים</span>
          <span className="summary-val max-w-[72%]">{itemsList}</span>
        </div>
        <div className="summary-row">
          <span className="summary-key">{PICKUP_FEE_LABEL}</span>
          <span className="summary-val text-xs font-normal leading-relaxed text-[var(--text-muted)]">
            כולל שינוע איסוף ומכתב AI מותאם
          </span>
        </div>
      </div>
    );
  }

  return (
    <dl className="space-y-3 rounded-2xl bg-violet-50/60 p-4 text-sm text-slate-700 sm:p-5">
      {form.pickupCity.trim() ? (
        <div className="flex justify-between gap-4 border-b border-violet-100 pb-2">
          <dt className="text-slate-500">עיר</dt>
          <dd className="max-w-[60%] text-start font-medium">{dashOr(form.pickupCity)}</dd>
        </div>
      ) : null}
      <div className="flex justify-between gap-4 border-b border-violet-100 pb-2">
        <dt className="text-slate-500">אזור איסוף</dt>
        <dd className="max-w-[60%] text-start font-medium">{dashOr(regionLabel)}</dd>
      </div>
      <div className="flex justify-between gap-4 border-b border-violet-100 pb-2">
        <dt className="text-slate-500">זמן לאיסוף</dt>
        <dd className="max-w-[65%] text-start font-medium leading-snug">{dashOr(pickupTimeLine)}</dd>
      </div>
      <div className="flex justify-between gap-4 border-b border-violet-100 pb-2">
        <dt className="shrink-0 text-slate-500">המשימה שלכם</dt>
        <dd className="max-w-[72%] text-start font-medium leading-snug">{dashOr(getDonationJourneyLabel(form.journeyType))}</dd>
      </div>
      <div className="flex justify-between gap-4 border-b border-violet-100 pb-2">
        <dt className="text-slate-500">שם מלא</dt>
        <dd className="font-medium text-slate-900">{dashOr(`${form.firstName} ${form.lastName}`.trim())}</dd>
      </div>
      <div className="flex justify-between gap-4 border-b border-violet-100 pb-2">
        <dt className="text-slate-500">טלפון</dt>
        <dd dir="ltr" className="font-medium">
          {dashOr(form.phone)}
        </dd>
      </div>
      <div className="flex justify-between gap-4 border-b border-violet-100 pb-2">
        <dt className="text-slate-500">מייל</dt>
        <dd dir="ltr" className="max-w-[65%] truncate font-medium">
          {dashOr(form.email)}
        </dd>
      </div>
      <div className="flex justify-between gap-4 border-b border-violet-100 pb-2">
        <dt className="shrink-0 text-slate-500">כתובת לאיסוף</dt>
        <dd className="max-w-[72%] text-start font-medium leading-snug">{dashOr(addressLine)}</dd>
      </div>
      <div className="flex justify-between gap-4 border-b border-violet-100 pb-2">
        <dt className="text-slate-500">קוד כניסה</dt>
        <dd dir="ltr" className="font-medium">
          {dashOr(form.doorCode)}
        </dd>
      </div>
      <div className="flex justify-between gap-4 border-b border-violet-100 pb-2">
        <dt className="text-slate-500">הערות לכתובת</dt>
        <dd className="max-w-[60%] text-start font-medium">{dashOr(form.addressNotes)}</dd>
      </div>
      <div className="flex justify-between gap-4 border-b border-violet-100 pb-2">
        <dt className="text-slate-500">שם הילד או הילדה</dt>
        <dd className="max-w-[65%] text-start font-medium">{dashOr(displayChildName)}</dd>
      </div>
      <div className="flex justify-between gap-4 border-b border-violet-100 pb-2">
        <dt className="shrink-0 text-slate-500">פריטים</dt>
        <dd className="max-w-[72%] text-start font-medium">{itemsList}</dd>
      </div>
      <div className="flex justify-between gap-4 pt-1">
        <dt className="font-medium text-slate-900">{PICKUP_FEE_LABEL}</dt>
        <dd className="text-start text-xs leading-relaxed text-slate-600">כולל שינוע איסוף ומכתב AI מותאם</dd>
      </div>
    </dl>
  );
}
