"use client";

import { useId, type ReactNode } from "react";
import { RequiredFieldStar } from "@/components/public/donation-form-progress";
import { cn } from "@/lib/utils";

export type DonationSegmentedOption<T extends string> = {
  value: T;
  label: string;
  description?: string;
};

type DonationSegmentedChoiceProps<T extends string> = {
  name: string;
  legend: ReactNode;
  options: readonly DonationSegmentedOption<T>[];
  value: T | "";
  onChange: (next: T) => void;
  fieldLabelClass: string;
  required?: boolean;
};

/**
 * קבוצת בחירה (רדיו ויזואלי) — מותג סגול ל־active, נגיש עם input אמיתי
 */
export function DonationSegmentedChoice<T extends string>({
  name,
  legend,
  options,
  value,
  onChange,
  fieldLabelClass,
  required,
}: DonationSegmentedChoiceProps<T>) {
  const legendId = useId();
  return (
    <fieldset className="space-y-3" aria-labelledby={legendId}>
      <legend id={legendId} className={cn(fieldLabelClass, "mb-1 w-full")}>
        {legend}
        {required ? <RequiredFieldStar /> : null}
      </legend>
      <div className="flex flex-col gap-2" role="presentation">
        {options.map((opt) => {
          const selected = value === opt.value;
          const inputId = `${name}-${opt.value}`;
          return (
            <label
              key={opt.value}
              htmlFor={inputId}
              className={cn(
                "flex min-h-[48px] cursor-pointer items-center gap-3 rounded-2xl border-2 px-4 py-3 text-start text-sm font-semibold transition-colors",
                selected
                  ? "border-[#9333EA] bg-white text-slate-900 shadow-sm shadow-[#9333EA]/15 ring-1 ring-[#9333EA]/20"
                  : "border-slate-200/90 bg-white/80 text-slate-800 hover:border-[#9333EA]/35",
              )}
            >
              <input
                id={inputId}
                type="radio"
                name={name}
                value={opt.value}
                checked={selected}
                onChange={() => onChange(opt.value)}
                className="size-4 shrink-0 accent-[#9333EA]"
              />
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span>{opt.label}</span>
                {opt.description ? (
                  <span className="text-xs font-normal text-slate-500">{opt.description}</span>
                ) : null}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
