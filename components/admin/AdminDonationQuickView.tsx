"use client";

import type { AdminDonationRow } from "@/hooks/useAdminDonations";
import { formatToyItemsLine } from "@/hooks/useAdminDonations";
import { Button } from "@/components/ui/button";

type AdminDonationQuickViewProps = {
  row: AdminDonationRow | null;
  onClose: () => void;
};

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-start">
      <dt className="text-[12px] font-semibold text-slate-500">{label}</dt>
      <dd className="mt-0.5 text-[14px] text-slate-900 whitespace-pre-wrap break-words">{value || "—"}</dd>
    </div>
  );
}

export function AdminDonationQuickView({ row, onClose }: AdminDonationQuickViewProps) {
  if (!row) return null;

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
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-[#F9F5FF] p-5 shadow-xl sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <h2 id="admin-quick-title" className="text-[16px] font-bold text-slate-900">
            פרטי בקשה
          </h2>
          <Button type="button" variant="outline" size="sm" className="shrink-0 rounded-lg" onClick={onClose}>
            סגירה
          </Button>
        </div>
        <p className="mt-1 text-[12px] text-slate-600">מזהה {row.id}</p>

        <dl className="mt-5 grid gap-4">
          <Field label="שם ילד או ילדה" value={row.child_name ?? ""} />
          <Field label="הורים" value={[row.first_name, row.last_name].filter(Boolean).join(" ")} />
          <Field label="טלפון" value={row.phone ?? ""} />
          <Field label="מייל" value={row.email ?? ""} />
          <Field label="כתובת" value={row.address ?? ""} />
          <Field label="קוד דלת" value={row.door_code ?? ""} />
          <Field label="הערות איסוף" value={row.pickup_notes ?? ""} />
          <Field label="מסלול" value={row.journey_type ?? ""} />
          <Field label="אזור וזמן" value={[row.scheduled_region, row.scheduled_slot].filter(Boolean).join(" · ")} />
          <Field label="עיר" value={row.pickup_city ?? ""} />
          <Field label="פריטים" value={formatToyItemsLine(row)} />
          <Field label="תיאור (legacy)" value={row.toy_description ?? ""} />
          <Field label="מכתב AI" value={row.ai_generated_letter ?? "עדיין לא נוצר"} />
        </dl>
      </div>
    </div>
  );
}
