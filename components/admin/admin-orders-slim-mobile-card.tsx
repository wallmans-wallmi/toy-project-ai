"use client";

import { AdminPortalFulfillmentQuickActions } from "@/components/admin/admin-portal-fulfillment-quick-actions";
import { Button } from "@/components/ui/button";
import type { AdminDashboardRole } from "@/lib/admin-role-types";
import type { AdminDonationPatch, AdminDonationRow } from "@/hooks/useAdminDonations";
import { adminDonationOrderNumberFallbackFromId, formatHebrewOrderNumberLabel } from "@/lib/admin-order-display";
import { extractCityKey } from "@/lib/admin-logistics-dashboard";
import {
  adminManualStatusPatch,
  adminOrderLifecycleStatusBadgeClass,
  adminOrderLifecycleStatusHe,
  adminSlimOrderStatusSelectOptions,
  isAdminSlimOfficeManualAction,
} from "@/lib/admin-order-lifecycle-status";
import { adminLifecyclePresetPatch, isAdminOrderLifecyclePresetLabel } from "@/lib/admin-order-lifecycle-preset-patch";
import { AdminResponsiveActionSelect } from "@/components/admin/admin-responsive-select";
import { Eye, Phone } from "lucide-react";

function telHref(p: string | null | undefined): string {
  if (!p) return "";
  const d = p.replace(/[^\d+]/g, "");
  return d ? `tel:${d}` : "";
}

function fullNameHe(r: AdminDonationRow): string {
  return [r.first_name, r.last_name]
    .map((x) => (x ?? "").trim())
    .filter(Boolean)
    .join(" ")
    .trim();
}

type Props = {
  r: AdminDonationRow;
  role: AdminDashboardRole;
  onUpdate: (id: string, patch: AdminDonationPatch) => Promise<boolean>;
  onQuickView: (row: AdminDonationRow) => void;
};

export function AdminOrdersSlimMobileCard({ r, role, onUpdate, onQuickView }: Props) {
  const canOffice = role === "admin" || role === "office";
  const name = fullNameHe(r) || "—";
  const child = (r.child_name ?? "").trim() || "—";
  const city = extractCityKey(r);
  const phone = (r.phone ?? "").trim();
  const tel = telHref(r.phone);
  const statusHe = adminOrderLifecycleStatusHe(r);
  const statusOptions = adminSlimOrderStatusSelectOptions(r, role);
  const orderNoLabel =
    r.order_number != null ? formatHebrewOrderNumberLabel(r.order_number) : adminDonationOrderNumberFallbackFromId(r.id);

  async function applyStatusSelect(raw: string) {
    if (!raw) return;
    if (role === "admin" && isAdminOrderLifecyclePresetLabel(raw)) {
      await onUpdate(r.id, adminLifecyclePresetPatch(raw));
      return;
    }
    if (isAdminSlimOfficeManualAction(raw)) {
      await onUpdate(r.id, adminManualStatusPatch(raw));
    }
  }

  return (
    <article className="rounded-2xl border border-[#9333EA]/20 bg-white p-4 shadow-sm" dir="rtl" lang="he">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold text-slate-500">id</p>
          <p className="mt-0.5 break-all font-mono text-[10px] leading-snug text-slate-600" dir="ltr" title={r.id}>
            {r.id}
          </p>
          <p className="mt-2 text-[11px] font-bold text-slate-500">מספר הזמנה</p>
          <p className="mt-0.5 font-mono text-[13px] font-bold text-[#581c87]" dir="ltr">
            {orderNoLabel}
          </p>
        </div>
        <Button type="button" size="sm" variant="outline" className="shrink-0 rounded-lg" aria-label="צפייה בכל הפרטים מהטופס" onClick={() => onQuickView(r)}>
          <Eye className="size-3.5" aria-hidden />
        </Button>
      </div>
      <p className="mt-3 text-[11px] font-bold text-slate-500">שם מלא</p>
      <p className="text-[15px] font-bold text-slate-900">{name}</p>
      <p className="mt-2 text-[11px] font-bold text-slate-500">שם הילד</p>
      <p className="text-[14px] font-semibold text-slate-800">{child}</p>
      <p className="mt-2 text-[11px] font-bold text-slate-500">עיר</p>
      <p className="text-[13px] text-slate-700">{city}</p>
      <p className="mt-2 text-[11px] font-bold text-slate-500">טלפון</p>
      {phone ? (
        <a href={tel} className="inline-flex items-center gap-1 text-[13px] font-semibold text-[#9333EA]" dir="ltr">
          <Phone className="size-3.5 shrink-0" aria-hidden />
          {phone}
        </a>
      ) : (
        <span className="text-[13px] text-slate-500">—</span>
      )}

      <p className="mt-3 text-[11px] font-bold text-slate-500">סטטוס</p>
      <div className="mt-1 flex flex-col gap-2">
        <span className={`w-fit max-w-full ${adminOrderLifecycleStatusBadgeClass(statusHe)}`} title={statusHe}>
          {statusHe}
        </span>
        <AdminPortalFulfillmentQuickActions r={r} role={role} onUpdate={onUpdate} />
      </div>

      <p className="mt-3 text-[11px] font-bold text-slate-500">התקדמות</p>
      {canOffice ? (
        <AdminResponsiveActionSelect
          key={`${r.id}-${r.payment_status ?? ""}-${r.portal_fulfillment_stage ?? ""}-${r.pickup_status ?? ""}-${r.delivery_status ?? ""}-${r.letter_status ?? ""}`}
          options={statusOptions}
          onPick={(v) => void applyStatusSelect(v)}
          disabled={statusOptions.length === 0}
          placeholder={statusOptions.length === 0 ? "אין פעולות זמינות" : "בחרו פעולה…"}
          ariaLabel="התקדמות: עדכון סטטוס"
          sheetTitle="עדכון התקדמות"
          sheetSubtitle="בוחרים פעולה אחת, השמירה לשרת מיד אחרי הבחירה"
          triggerClassName="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-[13px] font-medium disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
        />
      ) : (
        <p className="mt-1 text-[12px] text-slate-400">—</p>
      )}
    </article>
  );
}
