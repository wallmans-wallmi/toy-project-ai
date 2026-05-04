"use client";

import { DonationFormPaymentExtrasBlock } from "@/components/public/donation-form-region-legal";

type PickupSimulatedPaymentStepProps = {
  feeLabel: string;
  feeIls: number;
  checkoutError: string | null;
};

/**
 * מסך תשלום בהדמה — עד חיבור חברת סליקה. לחיצה על הכפתור בפוטר קוראת ל־runCheckout ושומרת ל־Supabase.
 */
export function PickupSimulatedPaymentStep({
  feeLabel,
  feeIls,
  checkoutError,
}: PickupSimulatedPaymentStepProps) {
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

      <div className="payment-amount">
        <span className="pay-label">{feeLabel}</span>
        <span className="pay-price" dir="ltr">
          ₪{feeIls}
        </span>
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
