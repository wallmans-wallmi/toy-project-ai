"use client";

import { CircleHelp, Minus, Plus, ShoppingBag } from "lucide-react";
import type { DonationFormState } from "@/hooks/use-donation-form";
import {
  PACKING_BAG_DIMENSIONS_TOOLTIP,
  PACKING_CHILD_COUNT_OPTIONS,
  PACKING_EXTRA_BAGS_MAX_PER_CHILD,
  clampPackingExtraBagCount,
  sumPackingExtraBags,
  type PackingChildCount,
} from "@/lib/donation-packing-kits";
import { EXTRA_BAG_FEE_ILS } from "@/lib/constants/pricing";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RequiredFieldStar } from "@/components/public/donation-form-progress";

const PICKUP_KID_LABELS: Record<
  PackingChildCount,
  { line: string; hint: string }
> = {
  1: { line: "ילד אחד או ילדה אחת", hint: "שקית אחת" },
  2: { line: "שני ילדים או שתי ילדות", hint: "2 שקיות" },
  3: { line: "שלושה ילדים או שלוש ילדות", hint: "3 שקיות" },
  4: { line: "ארבעה ילדים או ארבע ילדות", hint: "4 שקיות" },
};

/** סה״כ שקיות לילד או ילדה: אחת כלולה + נוספות */
function totalBagsForChildRow(extraBags: number): number {
  return 1 + clampPackingExtraBagCount(extraBags);
}

export type DonationFormPackingKitsStepProps = {
  form: DonationFormState;
  fieldLabelClass: string;
  sectionSubClass: string;
  inputClassName: string;
  isPickup: boolean;
  updateChildCount: (n: PackingChildCount) => void;
  updatePackingChildName: (index: number, value: string) => void;
  updatePackingExtraBag: (index: number, value: number) => void;
};

export function DonationFormPackingKitsStep({
  form,
  fieldLabelClass,
  sectionSubClass,
  inputClassName,
  isPickup,
  updateChildCount,
  updatePackingChildName,
  updatePackingExtraBag,
}: DonationFormPackingKitsStepProps) {
  const extraAll = sumPackingExtraBags(form.childCount, form.packingExtraBags);
  const totalBagsHousehold = form.childCount + extraAll;

  return (
    <div className="space-y-6" dir="rtl">
      <fieldset className="space-y-3 border-0 p-0">
        <legend className={cn(fieldLabelClass, "w-full px-0")}>
          כמה ילדים או ילדות מקבלים ערכת אריזה?
          <RequiredFieldStar />
        </legend>
        {isPickup ? (
          <>
            <div className="grid grid-cols-2 gap-3 sm:gap-3" role="group" aria-label="מספר ילדים לערכות אריזה">
              {PACKING_CHILD_COUNT_OPTIONS.map((n) => {
                const { line, hint } = PICKUP_KID_LABELS[n];
                const selected = form.childCount === n;
                return (
                  <button
                    key={n}
                    type="button"
                    onClick={() => updateChildCount(n)}
                    className={cn(
                      "flex flex-col items-center gap-1.5 rounded-2xl border-2 bg-stone-50 px-2 py-4 text-center font-sans transition-all sm:px-3 sm:py-4",
                      selected
                        ? "border-[#9333EA] bg-violet-50 shadow-[0_0_0_3px_rgba(147,51,234,0.12)]"
                        : "border-neutral-200 hover:border-[#9333EA] hover:bg-violet-50/80",
                    )}
                  >
                    <span className="text-[2rem] font-black leading-none text-[#9333EA]">{n}</span>
                    <span className="text-[0.78rem] font-semibold leading-snug text-neutral-900">{line}</span>
                    <span className="text-[0.72rem] font-normal text-neutral-500">{hint}</span>
                  </button>
                );
              })}
            </div>
            <div className="flex gap-2.5 rounded-xl border border-violet-200 bg-violet-50 px-3.5 py-3 text-[0.83rem] leading-relaxed text-neutral-600">
              <span aria-hidden>🎁</span>
              <span>כל ילד או ילדה יקבלו שקית אריזה משלהם</span>
            </div>
          </>
        ) : (
          <>
            <select
              id="child-count"
              className={cn(
                inputClassName,
                "flex h-10 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm",
              )}
              value={form.childCount}
              onChange={(e) => updateChildCount(Number(e.target.value) as PackingChildCount)}
            >
              {PACKING_CHILD_COUNT_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <p className={sectionSubClass}>
              לכל ילד או ילדה תיק אריזה ממותגת נפרדת, כדי שהמכתב והמתנה יגיעו בצורה מסודרת ונעימה
            </p>
          </>
        )}
      </fieldset>

      <div className="space-y-3">
        <div>
          <p className={cn("font-semibold text-slate-800", isPickup ? "text-sm" : "text-base")}>
            שם לכל ילד או ילדה
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs leading-relaxed text-neutral-600">
            <span>כל ילד או ילדה מקבלים שקית אריזה אחת כלולה</span>
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="inline-flex size-8 shrink-0 items-center justify-center rounded-full text-[#9333EA] transition hover:bg-violet-100 hover:text-[#7c3aed] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9333EA]"
                  aria-label="מידות שקית האריזה והמחיר לשקית נוספת"
                >
                  <CircleHelp className="size-4" strokeWidth={2} aria-hidden />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-[min(100vw-2rem,18rem)] p-4 text-start" align="end" sideOffset={6}>
                <p className="m-0 text-sm leading-relaxed text-neutral-800">{PACKING_BAG_DIMENSIONS_TOOLTIP}</p>
                <p className="mt-3 m-0 text-xs text-neutral-600">
                  שקית נוספת מעבר לכלולה: {EXTRA_BAG_FEE_ILS}₪ ליחידה
                </p>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <ul className="m-0 list-none space-y-4 p-0">
          {Array.from({ length: form.childCount }, (_, i) => {
            const extra = clampPackingExtraBagCount(form.packingExtraBags[i] ?? 0);
            const totalBagsThisChild = totalBagsForChildRow(extra);
            const canInc = extra < PACKING_EXTRA_BAGS_MAX_PER_CHILD;
            const canDec = totalBagsThisChild > 1;
            return (
              <li key={i}>
                <div
                  className={cn(
                    "flex flex-col gap-3 rounded-2xl border border-[#9333EA]/15 bg-[#F9F5FF]/80 p-4 sm:flex-row sm:items-start sm:gap-4",
                    isPickup && "rounded-2xl border-neutral-200 bg-white sm:items-stretch",
                  )}
                >
                  {isPickup ? (
                    <div
                      className="flex size-8 min-h-8 min-w-8 shrink-0 items-center justify-center rounded-full bg-violet-100 text-[0.75rem] font-extrabold text-[#9333EA]"
                      aria-hidden
                    >
                      {i + 1}
                    </div>
                  ) : (
                    <div
                      className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-white text-[#9333EA] shadow-sm ring-1 ring-[#9333EA]/20"
                      aria-hidden
                    >
                      <ShoppingBag className="size-7 stroke-[1.75]" strokeLinecap="round" strokeLinejoin="round" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1 space-y-2">
                    <Label htmlFor={`packing-child-${i}`} className={cn(fieldLabelClass, "m-0 block")}>
                      שם ילד או ילדה {i + 1}
                      <RequiredFieldStar />
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id={`packing-child-${i}`}
                        className={cn(
                          inputClassName,
                          "min-h-12 min-w-0 flex-1 basis-0 rounded-2xl",
                          isPickup && "pickup-native-field",
                        )}
                        value={form.packingChildNames[i] ?? ""}
                        onChange={(e) => updatePackingChildName(i, e.target.value)}
                        placeholder={`למשל ${i === 0 ? "נועם" : i === 1 ? "שיר" : "אורי"}`}
                        autoComplete="given-name"
                      />
                      <div className="flex shrink-0 flex-col items-end gap-1">
                        <span className={cn(fieldLabelClass, "m-0 block text-end text-neutral-600")}>
                          הוסף שקית
                        </span>
                        <div
                          className="flex h-12 shrink-0 items-center gap-0.5 rounded-2xl border border-violet-200/80 bg-white/90 px-0.5 py-0.5 shadow-sm"
                          dir="ltr"
                          role="group"
                          aria-label={`מספר שקיות אריזה לילד או ילדה ${i + 1}`}
                        >
                          <button
                            type="button"
                            className="inline-flex size-7 shrink-0 items-center justify-center rounded-xl text-neutral-500 transition hover:bg-violet-50 hover:text-[#9333EA] disabled:pointer-events-none disabled:opacity-40"
                            aria-label="הפחתת מספר שקיות"
                            disabled={!canDec}
                            onClick={() => updatePackingExtraBag(i, extra - 1)}
                          >
                            <Minus className="size-3.5" strokeWidth={2.25} aria-hidden />
                          </button>
                          <span
                            className="min-w-[1.75rem] px-0.5 text-center text-sm font-semibold tabular-nums text-neutral-700"
                            aria-live="polite"
                          >
                            {totalBagsThisChild}
                          </span>
                          <button
                            type="button"
                            className="inline-flex size-7 shrink-0 items-center justify-center rounded-xl text-[#9333EA] transition hover:bg-violet-50 disabled:pointer-events-none disabled:opacity-40"
                            aria-label="הוספת שקית"
                            disabled={!canInc}
                            onClick={() => updatePackingExtraBag(i, extra + 1)}
                          >
                            <Plus className="size-3.5" strokeWidth={2.25} aria-hidden />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
        <p
          className="m-0 rounded-xl border border-violet-200 bg-violet-50/70 px-3 py-2.5 text-center text-sm font-semibold text-[#581c87]"
          aria-live="polite"
        >
          {totalBagsHousehold === 1
            ? "בסך הכל תקבלו שקית אריזה אחת"
            : `בסך הכל תקבלו ${totalBagsHousehold} שקיות אריזה`}
        </p>
      </div>
    </div>
  );
}
