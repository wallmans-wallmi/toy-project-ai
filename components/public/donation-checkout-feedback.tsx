"use client";

import { Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

/** מסך טעינה בזמן insert ל־DB — מובייל־פירסט, RTL */
export function DonationCheckoutLoadingPanel({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-[#9333EA]/20 bg-[#F9F5FF] px-5 py-10 text-center shadow-inner sm:px-8",
        className,
      )}
      dir="rtl"
      lang="he"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-[#9333EA]/10">
        <Loader2 className="size-9 animate-spin text-[#9333EA]" strokeWidth={2.25} aria-hidden />
      </div>
      <p className="mt-5 text-base font-bold text-[#581c87]">רגע קסום — שומרים בשבילכן</p>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">
        הפרטים נשלחים בצורה מאובטחת. אל תסגרו את הטאב, אנחנו כבר שם.
      </p>
    </div>
  );
}

type DonationCheckoutSuccessPanelProps = {
  childName: string;
  referenceId: string;
  className?: string;
};

/** מסך הצלחה / ממתין לסליקה מקומית — טון אחותי, מותג סגול */
export function DonationCheckoutSuccessPanel({
  childName,
  referenceId,
  className,
}: DonationCheckoutSuccessPanelProps) {
  const displayName = childName.trim() || "ילד/תכם";

  return (
    <div
      className={cn(
        "rounded-2xl border border-[#9333EA]/25 bg-[#F9F5FF] px-5 py-8 text-center shadow-[0_12px_40px_-14px_rgba(147,51,234,0.28)] sm:px-8",
        className,
      )}
      dir="rtl"
      lang="he"
      role="status"
      aria-live="polite"
    >
      <div
        className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-[#9333EA] text-white shadow-lg shadow-[#9333EA]/35"
        aria-hidden
      >
        <Sparkles className="size-7" strokeWidth={2} />
      </div>
      <h3 className="font-heading text-lg font-bold tracking-tight text-[#581c87] sm:text-xl">
        הפרטים נשמרו בסטייל!
      </h3>
      <p className="mt-3 text-base leading-relaxed text-slate-800">
        הפרטים של <span className="font-semibold text-[#9333EA]">{displayName}</span> אצלנו — מיד
        נמשיך ל<strong className="font-semibold text-slate-900">סליקה בטוחה</strong>.
      </p>
      <p className="mt-3 text-sm leading-relaxed text-slate-600">
        תודה שסומכות עלינו. מתקשרות אליכן בקרוב עם הצעד הבא — בלי לחץ, עם חיוך.
      </p>
      <p className="mt-5 text-xs font-medium text-slate-500" dir="ltr">
        מספר פנייה: {referenceId}
      </p>
    </div>
  );
}
