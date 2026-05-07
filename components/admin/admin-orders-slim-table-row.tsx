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

export function AdminOrdersSlimTableRow({ r, role, onUpdate, onQuickView }: Props) {
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
    <tr className="align-middle text-[12px] hover:bg-violet-50/40">
      <td className="max-w-[128px] px-2 py-2 align-top font-mono text-[9px] leading-tight text-slate-600" dir="ltr" title={r.id}>
        <span className="block break-all">{r.id}</span>
      </td>
      <td
        className="whitespace-nowrap px-2 py-2 align-top font-mono text-[11px] font-bold text-[#581c87]"
        dir="ltr"
        title={r.order_number != null ? `מספר הזמנה ${formatHebrewOrderNumberLabel(r.order_number)}` : undefined}
      >
        {orderNoLabel}
      </td>
      <td className="px-2 py-2 font-medium text-slate-900">{name}</td>
      <td className="px-2 py-2 font-semibold text-slate-900">{child}</td>
      <td className="max-w-[100px] truncate px-2 py-2 text-slate-700" title={city}>
        {city}
      </td>
      <td className="px-2 py-2">
        {phone ? (
          <a href={tel} className="inline-flex items-center gap-1 font-semibold text-[#9333EA] hover:underline" dir="ltr">
            <Phone className="size-3 shrink-0" aria-hidden />
            {phone}
          </a>
        ) : (
          "—"
        )}
      </td>
      <td className="min-w-[120px] max-w-[200px] px-2 py-2 align-top">
        <div className="flex flex-col gap-1.5">
          <span className={`w-fit max-w-full ${adminOrderLifecycleStatusBadgeClass(statusHe)}`} title={statusHe}>
            {statusHe}
          </span>
          <AdminPortalFulfillmentQuickActions r={r} role={role} onUpdate={onUpdate} />
        </div>
      </td>
      <td className="min-w-[200px] max-w-[min(280px,28vw)] px-2 py-2 align-top">
        {canOffice ? (
          <AdminResponsiveActionSelect
            key={`${r.id}-${r.payment_status ?? ""}-${r.portal_fulfillment_stage ?? ""}-${r.pickup_status ?? ""}-${r.delivery_status ?? ""}-${r.letter_status ?? ""}`}
            options={statusOptions}
            onPick={(v) => void applyStatusSelect(v)}
            disabled={statusOptions.length === 0}
            placeholder={statusOptions.length === 0 ? "אין פעולות זמינות" : "בחרו פעולה…"}
            ariaLabel="התקדמות: עדכון סטטוס"
            sheetTitle="עדכון התקדמות"
            sheetSubtitle="השמירה לשרת מיד אחרי הבחירה"
            triggerClassName="w-full max-w-[260px] rounded-lg border border-slate-200 px-2 py-1.5 text-[11px] font-medium text-slate-800 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
          />
        ) : (
          <span className="text-[11px] text-slate-400">—</span>
        )}
      </td>
      <td className="w-12 px-2 py-2 align-top">
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="text-[10px]"
          aria-label="צפייה בכל הפרטים מהטופס"
          onClick={() => onQuickView(r)}
        >
          <Eye className="size-3" aria-hidden />
        </Button>
      </td>
    </tr>
  );
}
