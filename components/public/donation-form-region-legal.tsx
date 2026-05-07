"use client";

import Link from "next/link";
import { RequiredFieldStar } from "@/components/public/donation-form-progress";
import { ShippingPickers } from "@/components/forms/ShippingPickers";
import { PickupDoorNotice } from "@/components/public/pickup-door-notice";
import type { DonationFormState } from "@/hooks/use-donation-form";
import { applyPickupDateTime } from "@/hooks/useShippingDetails";
import { resolvePickupDateIsoForStandardSlot } from "@/lib/pickup-schedule-slots";
import type { PickupTimeSlot } from "@/lib/pickup-regions";
import { PICKUP_REGIONS } from "@/lib/pickup-regions";
import { cn } from "@/lib/utils";

type FieldUpdater = <K extends keyof DonationFormState>(key: K, value: DonationFormState[K]) => void;

export type DonationFormRegionSlotFieldsProps = {
  form: DonationFormState;
  pickupSplitSteps: boolean;
  fieldLabelClass: string;
  sectionSubClass: string;
  selectClassName: string;
  slots: PickupTimeSlot[];
  updateField: FieldUpdater;
  /** אם הוגדר, רק אזורים אלה יופיעו בבחירה (למשל פורטל לקוח ללא pending_coordination) */
  allowedRegionIds?: readonly string[];
};

export function DonationFormRegionSlotFields({
  form,
  pickupSplitSteps,
  fieldLabelClass,
  sectionSubClass,
  selectClassName,
  slots,
  updateField,
  allowedRegionIds,
}: DonationFormRegionSlotFieldsProps) {
  const regionsForSelect =
    allowedRegionIds && allowedRegionIds.length > 0
      ? PICKUP_REGIONS.filter((r) => allowedRegionIds.includes(r.id))
      : PICKUP_REGIONS;
  return (
    <>
      {pickupSplitSteps ? (
        <ShippingPickers form={form} updateField={updateField} slots={slots} />
      ) : (
        <>
          <div className="space-y-2">
            <label htmlFor="region" className={fieldLabelClass}>
              אזור איסוף
              <RequiredFieldStar />
            </label>
            <select
              id="region"
              className={selectClassName}
              value={form.region}
              onChange={(e) => updateField("region", e.target.value)}
            >
              <option value="">בחרו מהרשימה</option>
              {regionsForSelect.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label htmlFor="pickupSlot" className={fieldLabelClass}>
              זמן לאיסוף
              <RequiredFieldStar />
            </label>
            <select
              id="pickupSlot"
              className={selectClassName}
              value={form.pickupSlotId ?? ""}
              disabled={!form.region}
              onChange={(e) => {
                const raw = e.target.value;
                if (raw === "") {
                  updateField("pickupSlotId", null);
                  updateField("pickupDate", "");
                  return;
                }
                const dateIso = resolvePickupDateIsoForStandardSlot(raw, 0);
                if (dateIso) applyPickupDateTime(dateIso, raw, updateField);
                else updateField("pickupSlotId", raw);
              }}
            >
              <option value="">
                {form.region ? "בחרו יום ושעת איסוף" : "קודם יש לבחור אזור איסוף"}
              </option>
              {slots.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
            <p className={sectionSubClass}>לפי האזור נפתחים חלונות הזמן הרלוונטיים בלבד</p>
          </div>
        </>
      )}
      <PickupDoorNotice className={pickupSplitSteps ? "mt-1" : undefined} />
    </>
  );
}

export type DonationFormAgreementBlocksProps = {
  form: DonationFormState;
  pickupSplitSteps: boolean;
  isPickup: boolean;
  updateField: FieldUpdater;
};

export function DonationFormAgreementBlocks({
  form,
  pickupSplitSteps,
  isPickup,
  updateField,
}: DonationFormAgreementBlocksProps) {
  return (
    <>
      {pickupSplitSteps ? null : (
        <label
          className={cn(
            "flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 ps-4 pe-4 transition-colors hover:border-violet-200",
            isPickup && "min-h-[52px] rounded-3xl p-5",
          )}
        >
          <input
            type="checkbox"
            className="mt-1 size-5 shrink-0 rounded border-slate-300 text-[#9333EA] accent-[#9333EA]"
            checked={form.toysQualityConfirmed}
            onChange={(e) => updateField("toysQualityConfirmed", e.target.checked)}
          />
          <span
            className={cn("text-start text-sm leading-relaxed text-slate-800", isPickup && "text-xs")}
          >
            <RequiredFieldStar className="me-1 ms-0 inline" />
            מאשרים או מאשרות שהפריטים תקינים, נקיים ולא שבורים
          </span>
        </label>
      )}
      <label
        className={cn(
          "flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 ps-4 pe-4 transition-colors hover:border-violet-200",
          pickupSplitSteps && "rounded-[var(--radius-xs)] border-[#E5E7EB]",
          !pickupSplitSteps && isPickup && "min-h-[52px] rounded-3xl p-5",
        )}
      >
        <input
          type="checkbox"
          className="mt-1 size-5 shrink-0 rounded border-slate-300 text-[#9333EA] accent-[#9333EA]"
          checked={form.termsAccepted}
          onChange={(e) => updateField("termsAccepted", e.target.checked)}
        />
        <span
          className={cn(
            "text-start text-sm leading-relaxed text-slate-800",
            pickupSplitSteps && "text-[0.85rem]",
            !pickupSplitSteps && isPickup && "text-xs",
          )}
        >
          <RequiredFieldStar className="me-1 ms-0 inline" />
          מאשרים כי קראנו והסכמנו ל
          <Link
            href="/terms"
            className="mx-1 font-semibold text-[#9333EA] underline-offset-2 hover:underline"
          >
            תנאי השירות
          </Link>
          של האתר
        </span>
      </label>
    </>
  );
}

export type DonationFormPaymentExtrasBlockProps = { checkoutError: string | null };

export function DonationFormPaymentExtrasBlock({ checkoutError }: DonationFormPaymentExtrasBlockProps) {
  return (
    <>
      <ul className="space-y-2 text-xs text-slate-600 sm:text-sm">
        <li className="flex gap-2">
          <span className="text-[#9333EA]" aria-hidden>
            ✓
          </span>
          <span>שינוע ואיסוף עד הכתובת שמילאתם — תיאום חלון יתבצע עם הצוות אחרי ההרשמה</span>
        </li>
        <li className="flex gap-2">
          <span className="text-[#9333EA]" aria-hidden>
            ✓
          </span>
          <span>מכתב AI או תעודת גאווה — לפי המסלול שבחרתם</span>
        </li>
        <li className="flex gap-2">
          <span className="text-[#9333EA]" aria-hidden>
            ✓
          </span>
          <span>סליקה בטוחה ואיסוף — ניצור איתכן קשר בקרוב</span>
        </li>
      </ul>
      {checkoutError ? (
        <p
          className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {checkoutError}
        </p>
      ) : null}
    </>
  );
}
