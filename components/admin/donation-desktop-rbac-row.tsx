"use client";

import { AdminResponsiveFieldSelect } from "@/components/admin/admin-responsive-select";
import { AdminOrdersSlimTableRow } from "@/components/admin/admin-orders-slim-table-row";
import { AdminPortalFulfillmentQuickActions } from "@/components/admin/admin-portal-fulfillment-quick-actions";
import { DonationProgressTrackers } from "@/components/admin/donation-progress-trackers";
import { LetterRowQuickActions } from "@/components/admin/letter-row-quick-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AdminDashboardRole } from "@/lib/admin-role-types";
import type { AdminDonationPatch, AdminDonationRow } from "@/hooks/useAdminDonations";
import { formatToyItemsLine } from "@/hooks/useAdminDonations";
import { adminPickupMapsQuery } from "@/lib/admin-donation-address-display";
import { extractCityKey } from "@/lib/admin-logistics-dashboard";
import { getDonationJourneyLabel } from "@/lib/donation-journey";
import { cn } from "@/lib/utils";
import { Eye, MapPin, Phone } from "lucide-react";
import { useEffect, useState } from "react";

const LETTER_OPTS = ["pending", "generated", "sent", "completed", "failed"] as const;

function mapsUrl(q: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
}
function telHref(p: string | null | undefined) {
  if (!p) return "";
  const d = p.replace(/[^\d+]/g, "");
  return d ? `tel:${d}` : "";
}
function fmtTime(t: string | null | undefined) {
  if (!t) return "";
  return t.length >= 5 ? t.slice(0, 5) : t;
}
function lblDelivery(v: string | null | undefined) {
  const m: Record<string, string> = { at_warehouse: "במחסן", sent_to_ngo: "בדרך לעמותה", delivered: "הגיע לעמותה" };
  return m[v ?? ""] ?? (v || "—");
}

function lblLetterRbac(o: string) {
  const m: Record<string, string> = {
    pending: "ממתין",
    generated: "נוצר",
    sent: "נשלח",
    completed: "הושלם",
    failed: "נכשל",
  };
  return m[o] ?? o;
}

const LETTER_FIELD_OPTS_RBAC = LETTER_OPTS.map((o) => ({ value: o, label: lblLetterRbac(o) }));
const PAYMENT_FIELD_OPTS_RBAC = [
  { value: "pending", label: "ממתין" },
  { value: "completed", label: "שולם" },
  { value: "cancelled", label: "בוטל" },
];

export function DonationDesktopRbacRow({
  r,
  role,
  onUpdate,
  onQuickView,
  variant,
  slimOrdersLayout = false,
  showProgress,
  colSpan,
  lettersQueueMode = false,
  onLetterPreview,
}: {
  r: AdminDonationRow;
  role: AdminDashboardRole;
  onUpdate: (id: string, patch: AdminDonationPatch) => Promise<boolean>;
  onQuickView: (row: AdminDonationRow) => void;
  variant: "default" | "all";
  /** טבלת הזמנות מצומצמת: id, מספר הזמנה, שם, ילד, עיר, טלפון, סטטוס, התקדמות, עין */
  slimOrdersLayout?: boolean;
  showProgress: boolean;
  colSpan: number;
  lettersQueueMode?: boolean;
  onLetterPreview?: (title: string, body: string) => void;
}) {
  if (slimOrdersLayout) {
    return <AdminOrdersSlimTableRow r={r} role={role} onUpdate={onUpdate} onQuickView={onQuickView} />;
  }

  const canLog = role === "admin" || role === "driver";
  const canOffice = role === "admin" || role === "office";
  const canPay = role === "admin";
  const [fn, setFn] = useState(r.first_name ?? "");
  const [ln, setLn] = useState(r.last_name ?? "");
  const loc = adminPickupMapsQuery(r).trim();
  const tel = telHref(r.phone);
  const donorLine = [r.first_name, r.last_name].filter(Boolean).join(" ").trim() || "משפחה —";

  useEffect(() => {
    setFn(r.first_name ?? "");
    setLn(r.last_name ?? "");
  }, [r.id, r.first_name, r.last_name]);

  return (
    <>
      <tr className="align-top text-[12px] hover:bg-violet-50/40">
        <td className="px-2 py-2">
          <div className="flex flex-col gap-0.5">
            <span className="text-[16px] font-bold leading-tight text-slate-900">{r.child_name || "—"}</span>
            <span className="text-[12px] text-slate-500">{donorLine}</span>
          </div>
        </td>
        <td className="max-w-[120px] truncate px-2 py-2 text-[12px] text-slate-700" title={formatToyItemsLine(r)}>
          {formatToyItemsLine(r)}
        </td>
        <td className="px-2 py-2 text-[12px] text-slate-600">{getDonationJourneyLabel(r.journey_type ?? "")}</td>
        {variant === "all" ? (
          <>
            <td className="max-w-[88px] truncate px-2 py-2 text-slate-600" title={extractCityKey(r)}>
              {extractCityKey(r)}
            </td>
            <td className="px-2 py-2 text-slate-600">{lblDelivery(r.delivery_status)}</td>
            <td className="max-w-[100px] truncate px-2 py-2 text-slate-600" title={r.ngo_name ?? ""}>
              {r.ngo_name || "—"}
            </td>
          </>
        ) : null}
        <td className="px-2 py-2">
          <div className="flex flex-col gap-1">
            {tel ? (
              <a href={tel} className="inline-flex items-center gap-0.5 font-semibold text-[#9333EA] hover:underline">
                <Phone className="size-3" aria-hidden />
                חיוג
              </a>
            ) : null}
            {loc ? (
              <a href={mapsUrl(loc)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-0.5 text-[#581c87] hover:underline">
                <MapPin className="size-3" aria-hidden />
                מפה
              </a>
            ) : null}
          </div>
        </td>
        <td className="px-2 py-2">
          <div className="grid gap-0.5 text-[12px] font-medium text-slate-800">
            <span>{r.pickup_date || "—"}</span>
            <span className="text-[12px] text-slate-500">{fmtTime(r.pickup_time) || "—"}</span>
          </div>
        </td>
        <td className="px-2 py-2">
          {canLog ? (
            <div className="flex flex-col gap-1">
              <Button type="button" size="sm" className={cn("h-7 text-[10px]", (r.pickup_status ?? "") === "pending" && "bg-[#9333EA]")} variant={(r.pickup_status ?? "") === "pending" ? "default" : "outline"} onClick={() => void onUpdate(r.id, { pickup_status: "pending" })}>
                ממתין
              </Button>
              <Button type="button" size="sm" className={cn("h-7 text-[10px]", r.pickup_status === "picked_up" && "bg-emerald-600")} variant={r.pickup_status === "picked_up" ? "default" : "outline"} onClick={() => void onUpdate(r.id, { pickup_status: "picked_up" })}>
                נאסף
              </Button>
              <Button type="button" size="sm" className="h-7 text-[10px]" variant="outline" onClick={() => void onUpdate(r.id, { delivery_status: "delivered" })}>
                הגיע לעמותה
              </Button>
            </div>
          ) : (
            <span className="text-slate-400">
              {r.pickup_status} / {r.delivery_status}
            </span>
          )}
        </td>
        <td className="px-2 py-2">
          {canOffice ? (
            <AdminResponsiveFieldSelect
              triggerClassName="w-full rounded-lg border border-slate-200 px-1 py-1 text-[12px]"
              value={r.letter_status ?? "pending"}
              onChange={(next) => void onUpdate(r.id, { letter_status: next })}
              options={LETTER_FIELD_OPTS_RBAC}
              ariaLabel="סטטוס מכתב"
              sheetTitle="סטטוס מכתב"
              sheetSubtitle="העדכון נשמר מיד בשרת"
            />
          ) : (
            <span className="text-[12px]">{r.letter_status}</span>
          )}
        </td>
        {lettersQueueMode && onLetterPreview ? (
          <td className="px-1 py-2 align-middle">
            <LetterRowQuickActions r={r} role={role} onPreview={onLetterPreview} />
          </td>
        ) : null}
        <td className="px-2 py-2">
          {canOffice ? (
            <div className="grid gap-1">
              <Input className="h-7 text-[10px]" value={fn} onChange={(e) => setFn(e.target.value)} onBlur={() => void (fn !== (r.first_name ?? "") && onUpdate(r.id, { first_name: fn || null }))} placeholder="שם" />
              <Input className="h-7 text-[10px]" value={ln} onChange={(e) => setLn(e.target.value)} onBlur={() => void (ln !== (r.last_name ?? "") && onUpdate(r.id, { last_name: ln || null }))} placeholder="משפחה" />
            </div>
          ) : (
            <span className="text-slate-500">{r.first_name}</span>
          )}
        </td>
        <td className="px-2 py-2">
          {canPay ? (
            <AdminResponsiveFieldSelect
              triggerClassName="w-full rounded-lg border border-slate-200 px-1 py-1 text-[12px]"
              value={r.payment_status ?? "pending"}
              onChange={(next) => void onUpdate(r.id, { payment_status: next })}
              options={PAYMENT_FIELD_OPTS_RBAC}
              ariaLabel="סטטוס תשלום"
              sheetTitle="סטטוס תשלום"
              sheetSubtitle="העדכון נשמר מיד בשרת"
            />
          ) : (
            <span>{r.payment_status}</span>
          )}
        </td>
        <td className="px-2 py-2">
          <Button type="button" size="sm" variant="outline" className="text-[10px]" onClick={() => onQuickView(r)}>
            <Eye className="size-3" aria-hidden />
          </Button>
        </td>
      </tr>
      {showProgress ? (
        <tr className="bg-[#faf5ff]/50">
          <td colSpan={colSpan} className="space-y-2 px-2 py-2">
            <AdminPortalFulfillmentQuickActions r={r} role={role} onUpdate={onUpdate} />
            <DonationProgressTrackers r={r} />
          </td>
        </tr>
      ) : null}
    </>
  );
}
