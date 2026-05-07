"use client";

import { PortalOrderProgressBar } from "@/components/portal/portal-order-progress-bar";
import { PortalSchedulePickupPanel } from "@/components/portal/portal-schedule-pickup-panel";
import {
  canEditPickupSchedule,
  canShowSchedulePickupButton,
  comparePortalStages,
  deriveEffectiveFulfillmentStage,
  donationStageSourceFromPortalOrder,
  PORTAL_STAGE_LABELS,
  showKitDeliveredSmsPrompt,
} from "@/lib/portal/fulfillment-stages";
import { formatHebrewOrderNumberLabel } from "@/lib/admin-order-display";
import { PortalOrderInvoiceControl } from "@/components/portal/portal-order-invoice-control";
import type { PortalDonationOrder } from "@/lib/portal/types";

export type PortalSchedulePanelState = { donationId: string; mode: "schedule" | "edit" } | null;

type PortalOrderCardProps = {
  order: PortalDonationOrder;
  activePanel: PortalSchedulePanelState;
  onOpenPanel: (donationId: string, mode: "schedule" | "edit") => void;
  onClosePanel: () => void;
  onOrdersRefresh: () => void;
  /** כרטיס מלא או שורה קומפקטית להיסטוריה */
  variant?: "full" | "compact";
};

function pickupSummaryLine(order: PortalDonationOrder): string | null {
  const eff = deriveEffectiveFulfillmentStage(donationStageSourceFromPortalOrder(order));
  if (comparePortalStages(eff, "pickup_scheduled") < 0) return null;
  const datePart = order.pickupDate
    ? new Date(`${order.pickupDate}T12:00:00`).toLocaleDateString("he-IL", {
        weekday: "long",
        day: "numeric",
        month: "long",
      })
    : null;
  if (order.scheduledSlot && datePart) return `${order.scheduledSlot} · ${datePart}`;
  return order.scheduledSlot;
}

export function PortalOrderCard({
  order: o,
  activePanel,
  onOpenPanel,
  onClosePanel,
  onOrdersRefresh,
  variant = "full",
}: PortalOrderCardProps) {
  const stageSrc = donationStageSourceFromPortalOrder(o);
  const effective = deriveEffectiveFulfillmentStage(stageSrc);
  const smsPrompt = showKitDeliveredSmsPrompt(stageSrc);
  const showSchedule = canShowSchedulePickupButton(stageSrc);
  const showEdit = canEditPickupSchedule(stageSrc);
  const pickupLine = pickupSummaryLine(o);
  const isPanel = activePanel?.donationId === o.id;

  if (variant === "compact") {
    return (
      <li className="flex flex-wrap items-center justify-between gap-2 border-b border-violet-100 py-3 text-sm last:border-0" dir="rtl" lang="he">
        <time className="text-xs text-slate-500" dateTime={o.createdAt}>
          {new Date(o.createdAt).toLocaleDateString("he-IL")}
        </time>
        <span className="font-medium text-slate-800">{o.toyItemCount} פריטים</span>
        <span className="text-xs font-semibold text-[#9333EA]">
          {o.orderNumber != null ? `${formatHebrewOrderNumberLabel(o.orderNumber)} · ` : null}
          {PORTAL_STAGE_LABELS[effective]}
        </span>
        <PortalOrderInvoiceControl invoiceUrl={o.invoiceUrl} variant="icon" className="ms-auto" />
      </li>
    );
  }

  return (
    <li
      className="rounded-2xl border border-violet-200/80 bg-stone-50 p-4 transition-colors hover:border-violet-200 hover:bg-violet-50/50 sm:p-5"
      dir="rtl"
      lang="he"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xl" aria-hidden>
            📦
          </span>
          <div>
            <p className="text-[0.88rem] font-bold text-neutral-900">
              {o.childName ? `שם למכתב: ${o.childName}` : "תרומת צעצועים"}
            </p>
            {o.orderNumber != null ? (
              <p className="mt-0.5 text-[0.85rem] font-bold text-[#581c87]" dir="ltr">
                מספר הזמנה {formatHebrewOrderNumberLabel(o.orderNumber)}
              </p>
            ) : null}
            <p className="mt-0.5 font-mono text-[0.7rem] text-neutral-400" dir="ltr">
              מזהה טכני {o.id.slice(0, 8)}…
            </p>
          </div>
        </div>
        <time className="text-[0.75rem] text-neutral-500" dateTime={o.createdAt}>
          {new Date(o.createdAt).toLocaleString("he-IL")}
        </time>
      </div>

      <div className="mt-4 rounded-2xl border border-violet-200/90 bg-white p-4">
        <PortalOrderProgressBar order={o} />
      </div>

      {smsPrompt ? (
        <div
          className="mt-3 rounded-xl border border-pink-200 bg-pink-50/80 px-3 py-2 text-xs leading-relaxed text-pink-950"
          role="status"
        >
          <span className="font-semibold">SMS: </span>
          נשלחה אליכם הודעת טקסט כדי לתאם את האיסוף אחרי שהערכה הגיעה (סימולציה במערכת)
          {o.portalKitDeliveredSmsAt ? (
            <span className="mt-1 block text-pink-900/90">
              חותמת זמן: {new Date(o.portalKitDeliveredSmsAt).toLocaleString("he-IL")}
            </span>
          ) : null}
        </div>
      ) : null}

      {pickupLine ? (
        <div className="mt-3 rounded-xl border border-violet-100 bg-violet-50/50 px-3 py-2 text-sm text-slate-800">
          <span className="font-semibold text-[#9333EA]">{PORTAL_STAGE_LABELS.pickup_scheduled}: </span>
          {pickupLine}
        </div>
      ) : null}

      {effective === "donated" ? (
        <p className="mt-2 text-xs font-medium text-emerald-800">
          {o.letterStatus === "completed"
            ? "המשלוח נתרם והמכתב מוכן"
            : "המשלוח נתרם, מכינים את מכתב ה־AI החמים ביחד איתכם"}
        </p>
      ) : null}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <PortalOrderInvoiceControl invoiceUrl={o.invoiceUrl} />
        {showSchedule ? (
          <button
            type="button"
            className="rounded-xl bg-[#9333EA] px-4 py-2 text-sm font-semibold text-white shadow-sm"
            onClick={() => onOpenPanel(o.id, "schedule")}
          >
            תיאום איסוף מהבית
          </button>
        ) : null}
        {showEdit ? (
          <button
            type="button"
            className="rounded-xl border border-violet-200 bg-white px-4 py-2 text-sm font-semibold text-[#9333EA]"
            onClick={() => onOpenPanel(o.id, "edit")}
          >
            עריכת מועד
          </button>
        ) : null}
      </div>

      {isPanel && activePanel ? (
        <PortalSchedulePickupPanel
          donationId={o.id}
          order={o}
          mode={activePanel.mode}
          onClose={onClosePanel}
          onSuccess={() => onOrdersRefresh()}
        />
      ) : null}

      <p className="mt-3 text-xs text-slate-500">
        תשלום: {o.paymentStatus} · איסוף: {o.pickupStatus} · מכתב: {o.letterStatus}
      </p>
      <p className="mt-2 text-xs font-medium text-[#9333EA]">שולם: ₪{o.amountPaid}</p>
    </li>
  );
}
