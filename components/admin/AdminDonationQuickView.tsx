"use client";

import type { AdminDonationRow } from "@/hooks/useAdminDonations";
import { formatToyItemsLine } from "@/hooks/useAdminDonations";
import { adminPickupDisplayBlock, adminPickupMapsQuery, adminStructuredStreetLine } from "@/lib/admin-donation-address-display";
import { adminOrderLifecycleStatusHe } from "@/lib/admin-order-lifecycle-status";
import { formatHebrewOrderNumberLabel } from "@/lib/admin-order-display";
import { getDonationJourneyLabel } from "@/lib/donation-journey";
import { Button } from "@/components/ui/button";

type AdminDonationQuickViewProps = {
  row: AdminDonationRow | null;
  onClose: () => void;
};

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-start">
      <dt className="text-[12px] font-semibold text-slate-500">{label}</dt>
      <dd className="mt-0.5 whitespace-pre-wrap break-words text-[14px] text-slate-900">{value || "—"}</dd>
    </div>
  );
}

export function AdminDonationQuickView({ row, onClose }: AdminDonationQuickViewProps) {
  if (!row) return null;

  const structured = adminStructuredStreetLine(row);
  const amount = typeof row.amount_paid === "number" && Number.isFinite(row.amount_paid) ? row.amount_paid : 0;
  const navLine = adminPickupMapsQuery(row).trim();
  const systemStatus = adminOrderLifecycleStatusHe(row);
  const letterBody = (row.ai_letter_content ?? row.ai_generated_letter ?? "").trim();

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-quick-title"
      dir="rtl"
      lang="he"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-[#F9F5FF] p-5 shadow-xl sm:max-w-xl sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <h2 id="admin-quick-title" className="text-[16px] font-bold text-slate-900">
            כל הפרטים מהטופס באתר
          </h2>
          <Button type="button" variant="outline" size="sm" className="shrink-0 rounded-lg" onClick={onClose}>
            סגירה
          </Button>
        </div>
        <div className="mt-1 space-y-1 text-[12px] text-slate-600">
          {row.order_number != null ? (
            <p className="font-semibold text-[#581c87]">מספר הזמנה {formatHebrewOrderNumberLabel(row.order_number)}</p>
          ) : null}
          <p className="font-mono text-[11px] text-slate-500" dir="ltr">
            מזהה טכני: {row.id}
          </p>
        </div>
        <p className="mt-2 rounded-xl border border-violet-200 bg-white px-3 py-2 text-[12px] font-semibold text-[#581c87]">
          סטטוס במערכת: {systemStatus}
        </p>

        <dl className="mt-5 grid gap-4">
          <Field label="שם פרטי" value={row.first_name ?? ""} />
          <Field label="שם משפחה" value={row.last_name ?? ""} />
          <Field label="שם ילד או ילדה (למכתב)" value={row.child_name ?? ""} />
          <Field label="טלפון" value={row.phone ?? ""} />
          <Field label="מייל" value={row.email ?? ""} />
          <Field label="עיר לאיסוף" value={row.pickup_city ?? ""} />
          <Field label="רחוב (שדה)" value={row.street_name ?? ""} />
          <Field label="מספר בית" value={row.house_number ?? ""} />
          <Field label="דירה" value={row.apartment_number ?? ""} />
          <Field label="קומה" value={row.floor ?? ""} />
          <Field label="קוד שער" value={row.door_code ?? ""} />
          <Field label="הערות לכתובת" value={row.address_notes ?? ""} />
          <Field label="שורת כתובת מלאה מהטופס" value={row.address ?? ""} />
          <Field label="כתובת לאיסוף (לוגיסטיקה)" value={row.pickup_address ?? ""} />
          <Field label="פירוט כתובת ואיסוף" value={adminPickupDisplayBlock(row)} />
          {structured ? <Field label="רחוב מפורק (שורה)" value={structured} /> : null}
          <Field label="שורה לניווט במפה" value={navLine} />
          <Field label="הערות לאיסוף / ערכות אריזה" value={row.pickup_notes ?? ""} />
          <Field label="אזור איסוף" value={row.scheduled_region ?? ""} />
          <Field label="חלון זמן" value={row.scheduled_slot ?? ""} />
          <Field label="תאריך איסוף שנבחר" value={row.pickup_date ?? ""} />
          <Field label="שעת איסוף" value={row.pickup_time ?? ""} />
          <Field label="מסלול" value={getDonationJourneyLabel(row.journey_type ?? "")} />
          <Field label="סכום ששולם (₪)" value={String(amount)} />
          <Field label="פריטים מהטופס" value={formatToyItemsLine(row)} />
          <Field label="תיאור נוסף (אם הוזן)" value={row.toy_description ?? ""} />
          <Field label="שלב במשפך" value={row.funnel_stage ?? ""} />
          <Field label="שלב פורטל לקוח" value={row.portal_fulfillment_stage ?? ""} />
          <Field label="תשלום" value={row.payment_status ?? ""} />
          <Field label="איסוף" value={row.pickup_status ?? ""} />
          <Field label="משלוח לעמותה" value={row.delivery_status ?? ""} />
          <Field label="מכתב" value={row.letter_status ?? ""} />
          <Field label="עמותה" value={row.ngo_name ?? row.target_ngo_name ?? ""} />
          <Field label="עיר עמותה" value={row.target_ngo_city ?? ""} />
          <Field label="מועד אספקה לעמותה" value={row.delivery_time ?? ""} />
          <Field label="מכתב AI (טקסט)" value={letterBody || "עדיין לא נוצר"} />
        </dl>
      </div>
    </div>
  );
}
