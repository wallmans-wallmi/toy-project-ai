import type { DonationFormState } from "@/hooks/use-donation-form";
import {
  EXTRA_BAG_FEE_ILS,
  PICKUP_FEE_ILS,
  PICKUP_FEE_LABEL,
  pickupCheckoutTotalIls,
} from "@/lib/constants/pricing";
import {
  summaryLinesFromFormInput,
  type CheckoutItemsFormInput,
} from "@/lib/donation-checkout-items";
import { displayPrimaryChildName } from "@/components/public/donation-form-validation";
import { getDonationJourneyLabel } from "@/lib/donation-journey";
import { formatPickupAddressLine, formatPickupCityAndStreetLine } from "@/lib/format-pickup-address";
import { activePackingChildNames, sumPackingExtraBags } from "@/lib/donation-packing-kits";
import type { PickupTimeSlot } from "@/lib/pickup-regions";
import { isDeferredPickupSchedulingRegion } from "@/lib/pickup-regions";
import { formatPickupTimeSummaryLine } from "@/lib/pickup-schedule-slots";

type DonationFormSummaryProps = {
  form: DonationFormState;
  regionLabel: string | undefined;
  selectedSlot: PickupTimeSlot | undefined;
  /** עיצוב כרטיס סיכום מ־HTML v2 */
  variant?: "default" | "claude";
  /** מסלול איסוף מקוצר: בלי רשימת פריטים */
  hideItems?: boolean;
};

function dashOr(value: string | undefined | null): string {
  const v = value?.trim();
  return v ? v : "לא צוין";
}

function checkoutInput(form: DonationFormState): CheckoutItemsFormInput {
  return {
    journeyType: form.journeyType,
    childName: form.childName,
    toyItems: form.toyItems,
  };
}

export function DonationFormSummary({
  form,
  regionLabel,
  selectedSlot,
  variant = "default",
  hideItems = false,
}: DonationFormSummaryProps) {
  const itemsInput = checkoutInput(form);
  const itemLines = hideItems ? [] : summaryLinesFromFormInput(itemsInput);
  const displayChildName = displayPrimaryChildName(form);
  const packingNames = activePackingChildNames(form).join(" · ");
  const extraBagCount = sumPackingExtraBags(form.childCount, form.packingExtraBags);
  const extraBagChargeIls = extraBagCount * EXTRA_BAG_FEE_ILS;
  const estimatedCheckoutIls = pickupCheckoutTotalIls(extraBagCount);
  const addressLine = formatPickupAddressLine(form);
  const cityStreetLine = formatPickupCityAndStreetLine(form);
  const deferredScheduling = isDeferredPickupSchedulingRegion(form.region);
  const pickupTimeLine = deferredScheduling
    ? (selectedSlot?.label?.trim() ?? "יתואם עם הצוות אחרי ההרשמה")
    : formatPickupTimeSummaryLine(form.pickupDate, form.pickupSlotId, selectedSlot?.label ?? "") ||
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
    if (hideItems) {
      return (
        <div className="summary-card" dir="rtl">
          <div className="summary-row">
            <span className="summary-key">{form.childCount > 1 ? "שמות הילדים או הילדות" : "שם הילד או הילדה"}</span>
            <span className="summary-val text-start leading-snug">{dashOr(packingNames)}</span>
          </div>
          <div className="summary-row">
            <span className="summary-key">מספר שקיות</span>
            <span className="summary-val">{form.childCount}</span>
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
            <span className="summary-key">כתובת</span>
            <span className="summary-val text-start leading-snug">{dashOr(cityStreetLine)}</span>
          </div>
          <div className="summary-row">
            <span className="summary-key">קוד כניסה</span>
            <span className="summary-val" dir="ltr">
              {dashOr(form.doorCode)}
            </span>
          </div>
          <div className="summary-row">
            <span className="summary-key">הערות</span>
            <span className="summary-val text-start">{dashOr(form.addressNotes)}</span>
          </div>
          <div className="summary-row">
            <span className="summary-key">דמי בסיס (שינוע ואיסוף)</span>
            <span className="summary-val font-semibold tabular-nums text-[var(--text)]" dir="ltr">
              ₪{PICKUP_FEE_ILS}
            </span>
          </div>
          <div className="summary-row">
            <span className="summary-key">שקיות נוספות</span>
            <span className="summary-val text-start text-xs leading-snug text-[var(--text-muted)]">
              {extraBagCount > 0
                ? `${extraBagCount} במחיר ${EXTRA_BAG_FEE_ILS}₪ ליחידה (סה״כ ₪${extraBagChargeIls})`
                : "אין — שקית אחת כלולה לכל ילד או ילדה"}
            </span>
          </div>
          <div className="summary-row border-t border-[var(--border)] pt-2">
            <span className="summary-key font-bold">סה״כ משוער לתשלום</span>
            <span className="summary-val font-black tabular-nums text-[#9333EA]" dir="ltr">
              ₪{estimatedCheckoutIls}
            </span>
          </div>
          <p className="m-0 px-1 text-center text-xs leading-relaxed text-[var(--text-muted)]">
            {PICKUP_FEE_LABEL} — כולל שינוע איסוף ומכתב AI מותאם
          </p>
        </div>
      );
    }

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
          <span className="summary-key">ערכות אריזה</span>
          <span className="summary-val text-start leading-snug">
            {form.childCount} · {dashOr(packingNames)}
          </span>
        </div>
        <div className="summary-row">
          <span className="summary-key">{deferredScheduling ? "תיאום איסוף" : "זמן לאיסוף"}</span>
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
          <span className="summary-val text-start leading-snug">{dashOr(cityStreetLine || addressLine)}</span>
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
          <span className="summary-key">שם ראשי למכתב</span>
          <span className="summary-val">{dashOr(displayChildName)}</span>
        </div>
        <div className="summary-row">
          <span className="summary-key">פריטים</span>
          <span className="summary-val max-w-[72%]">{itemsList}</span>
        </div>
        <div className="summary-row">
          <span className="summary-key">דמי בסיס (שינוע ואיסוף)</span>
          <span className="summary-val font-semibold tabular-nums text-[var(--text)]" dir="ltr">
            ₪{PICKUP_FEE_ILS}
          </span>
        </div>
        <div className="summary-row">
          <span className="summary-key">שקיות נוספות</span>
          <span className="summary-val text-start text-xs leading-snug text-[var(--text-muted)]">
            {extraBagCount > 0
              ? `${extraBagCount} במחיר ${EXTRA_BAG_FEE_ILS}₪ ליחידה (סה״כ ₪${extraBagChargeIls})`
              : "אין — שקית אחת כלולה לכל ילד או ילדה"}
          </span>
        </div>
        <div className="summary-row border-t border-[var(--border)] pt-2">
          <span className="summary-key font-bold">סה״כ משוער לתשלום</span>
          <span className="summary-val font-black tabular-nums text-[#9333EA]" dir="ltr">
            ₪{estimatedCheckoutIls}
          </span>
        </div>
        <p className="m-0 px-1 text-center text-xs leading-relaxed text-[var(--text-muted)]">
          {PICKUP_FEE_LABEL} — כולל שינוע איסוף ומכתב AI מותאם
        </p>
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
        <dt className="text-slate-500">ערכות אריזה</dt>
        <dd className="max-w-[65%] text-start font-medium leading-snug">
          {form.childCount} · {dashOr(packingNames)}
        </dd>
      </div>
      <div className="flex justify-between gap-4 border-b border-violet-100 pb-2">
        <dt className="text-slate-500">{deferredScheduling ? "תיאום איסוף" : "זמן לאיסוף"}</dt>
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
        <dt className="text-slate-500">שם ראשי למכתב</dt>
        <dd className="max-w-[65%] text-start font-medium">{dashOr(displayChildName)}</dd>
      </div>
      {hideItems ? null : (
        <div className="flex justify-between gap-4 border-b border-violet-100 pb-2">
          <dt className="shrink-0 text-slate-500">פריטים</dt>
          <dd className="max-w-[72%] text-start font-medium">{itemsList}</dd>
        </div>
      )}
      <div className="flex justify-between gap-4 border-b border-violet-100 pb-2">
        <dt className="text-slate-500">דמי בסיס (שינוע ואיסוף)</dt>
        <dd className="font-semibold tabular-nums text-slate-900" dir="ltr">
          ₪{PICKUP_FEE_ILS}
        </dd>
      </div>
      <div className="flex justify-between gap-4 border-b border-violet-100 pb-2">
        <dt className="shrink-0 text-slate-500">שקיות נוספות</dt>
        <dd className="max-w-[65%] text-start text-xs font-medium leading-snug text-slate-700">
          {extraBagCount > 0
            ? `${extraBagCount} במחיר ${EXTRA_BAG_FEE_ILS}₪ ליחידה (סה״כ ₪${extraBagChargeIls})`
            : "אין — שקית אחת כלולה לכל ילד או ילדה"}
        </dd>
      </div>
      <div className="flex justify-between gap-4 border-b border-violet-200 pb-2">
        <dt className="font-bold text-slate-900">סה״כ משוער לתשלום</dt>
        <dd className="font-black tabular-nums text-[#9333EA]" dir="ltr">
          ₪{estimatedCheckoutIls}
        </dd>
      </div>
      <div className="flex justify-between gap-4 pt-1">
        <dt className="font-medium text-slate-900">{PICKUP_FEE_LABEL}</dt>
        <dd className="text-start text-xs leading-relaxed text-slate-600">כולל שינוע איסוף ומכתב AI מותאם</dd>
      </div>
    </dl>
  );
}
