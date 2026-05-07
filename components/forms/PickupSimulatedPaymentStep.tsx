"use client";

import { DonationFormPaymentExtrasBlock } from "@/components/public/donation-form-region-legal";

type PickupSimulatedPaymentStepProps = {
  /** דמי שינוע ואיסוף בסיס */
  baseFeeIls: number;
  baseFeeLabel: string;
  /** סה״כ שקיות נוספות מכל הילדים או הילדות */
  extraBagCount: number;
  /** מחיר לשקית נוספת */
  extraBagUnitIls: number;
  /** סכום כולל לתשלום */
  totalIls: number;
  checkoutError: string | null;
};

/**
 * מסך תשלום בהדמה — עד חיבור חברת סליקה. לחיצה על הכפתור בפוטר קוראת ל־runCheckout ושומרת ל־Supabase.
 */
export function PickupSimulatedPaymentStep({
  baseFeeIls,
  baseFeeLabel,
  extraBagCount,
  extraBagUnitIls,
  totalIls,
  checkoutError,
}: PickupSimulatedPaymentStepProps) {
  const extraCharge = extraBagCount * extraBagUnitIls;

  return (
    <div className="payment-box checkout-brand-surface space-y-4">
      <p
        role="status"
        className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-start text-sm leading-relaxed text-amber-950"
      >
        כאן יופיע מסך אשראי אמיתי כשתתחברו לחברת סליקה. כרגע זו{" "}
        <strong className="font-bold">הדמה בלבד</strong> — הכפתור למטה שולח את הכל לשרת ונרשמת
        שורה חדשה בטבלת התרומות במסד הנתונים (כולל הפריטים והסטטוס ממתין לתשלום), בלי חברת סליקה
        חיצונית בשלב הזה
      </p>

      <div className="space-y-2 rounded-2xl border border-violet-100 bg-violet-50/40 px-4 py-3 text-start" dir="rtl">
        <div className="flex flex-wrap items-baseline justify-between gap-2 text-sm text-neutral-700">
          <span>{baseFeeLabel}</span>
          <span className="font-semibold tabular-nums" dir="ltr">
            ₪{baseFeeIls}
          </span>
        </div>
        {extraBagCount > 0 ? (
          <div className="flex flex-wrap items-baseline justify-between gap-2 text-sm text-neutral-700">
            <span>
              שקיות נוספות ({extraBagCount} × {extraBagUnitIls}₪)
            </span>
            <span className="font-semibold tabular-nums text-[#9333EA]" dir="ltr">
              ₪{extraCharge}
            </span>
          </div>
        ) : null}
        <div className="payment-amount border-t border-violet-200 pt-3">
          <span className="pay-label">סה״כ לתשלום</span>
          <span className="pay-price" dir="ltr">
            ₪{totalIls}
          </span>
        </div>
      </div>

      <div className="space-y-3 rounded-2xl border border-slate-200 bg-white/95 p-4 text-start shadow-sm">
        <p className="text-xs font-semibold text-slate-600">פרטי כרטיס (תצוגה לדוגמה בלבד)</p>
        <div className="flex min-h-11 items-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 text-sm text-slate-400">
          מספר כרטיס יוצג כאן
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex min-h-11 items-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 text-sm text-slate-400">
            תוקף
          </div>
          <div className="flex min-h-11 items-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 text-sm text-slate-400">
            קוד אבטחה
          </div>
        </div>
      </div>

      <DonationFormPaymentExtrasBlock checkoutError={checkoutError} />

      <p className="secure-badge text-start">
        הנתונים נשלחים לשרת מאובטח ונשמרים בבסיס הנתונים שלכן — בלי חברת סליקה אמיתית בשלב הזה
      </p>
    </div>
  );
}
