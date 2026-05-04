"use client";

import { cn } from "@/lib/utils";

type DonationFormulaNoticeProps = {
  className?: string;
};

/**
 * הודעת פורמולה — בולטת אך משתלבת במותג (סגול + רקע בהיר)
 */
export function DonationFormulaNotice({ className }: DonationFormulaNoticeProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      dir="rtl"
      className={cn(
        "relative overflow-hidden rounded-2xl border border-[#9333EA]/30 bg-gradient-to-br from-[#F9F5FF] via-white to-violet-50/90 px-4 py-4 ps-12 shadow-md shadow-[#9333EA]/10",
        "before:absolute before:inset-y-0 before:start-0 before:w-1 before:bg-[#9333EA]",
        className,
      )}
    >
      <span
        className="absolute start-3 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-[#9333EA]/10 text-base"
        aria-hidden
      >
        ℹ️
      </span>
      <p className="text-sm font-bold leading-snug text-[#581c87]">
        אנחנו אוספים רק פורמולות סגורות ובתוקף
      </p>
      <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
        זה חשוב לבריאות ולבטיחות — אם יש לכן שאלה, נשמח לעזור בוואטסאפ לפני האיסוף.
      </p>
    </div>
  );
}
