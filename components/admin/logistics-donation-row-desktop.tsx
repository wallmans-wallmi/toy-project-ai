"use client";

import type { AdminDonationPatch, AdminDonationRow } from "@/hooks/useAdminDonations";
import { formatToyItemsLine } from "@/hooks/useAdminDonations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getDonationJourneyLabel } from "@/lib/donation-journey";
import { cn } from "@/lib/utils";
import { Building2, Eye, Truck } from "lucide-react";
import { useState } from "react";

const PICKUP_STATUS = ["pending", "picked_up", "failed"] as const;
const DELIVERY_STATUS = ["at_warehouse", "sent_to_ngo", "delivered"] as const;

function labelPickup(s: string) {
  const m: Record<string, string> = { pending: "ממתין לאיסוף", picked_up: "נאסף", failed: "איסוף נכשל" };
  return m[s] ?? s;
}

function labelDelivery(s: string) {
  const m: Record<string, string> = {
    at_warehouse: "במחסן",
    sent_to_ngo: "בדרך לעמותה",
    delivered: "הגיע ליעד",
  };
  return m[s] ?? s;
}

function badgePickup(s: string | null | undefined) {
  switch (s) {
    case "picked_up":
      return "bg-emerald-100 text-emerald-900 ring-1 ring-emerald-200";
    case "failed":
      return "bg-rose-100 text-rose-900 ring-1 ring-rose-200";
    default:
      return "bg-amber-100 text-amber-950 ring-1 ring-amber-200";
  }
}

function badgeDelivery(s: string | null | undefined) {
  switch (s) {
    case "delivered":
      return "bg-emerald-100 text-emerald-900 ring-1 ring-emerald-200";
    case "sent_to_ngo":
      return "bg-sky-100 text-sky-900 ring-1 ring-sky-200";
    default:
      return "bg-violet-100 text-violet-900 ring-1 ring-violet-200";
  }
}

function formatTime(v: string | null | undefined): string {
  if (!v) return "";
  return v.length >= 5 ? v.slice(0, 5) : v;
}

function deliveryLocalValue(iso: string | null | undefined): string {
  if (!iso) return "";
  return new Date(iso).toLocaleString("sv-SE", { hour12: false }).replace(" ", "T").slice(0, 16);
}

export function LogisticsDonationRowDesktop({
  r,
  onUpdate,
  onQuickView,
}: {
  r: AdminDonationRow;
  onUpdate: (id: string, patch: AdminDonationPatch) => Promise<boolean>;
  onQuickView: (row: AdminDonationRow) => void;
}) {
  const [ngoName, setNgoName] = useState(r.target_ngo_name ?? "");
  const [ngoCity, setNgoCity] = useState(r.target_ngo_city ?? "");
  const [addr, setAddr] = useState(r.pickup_address ?? r.address ?? "");

  return (
    <tr className="align-top hover:bg-violet-50/40">
      <td className="px-2 py-2 text-slate-800">
        <p className="font-medium text-slate-900">{r.child_name || "—"}</p>
        <p className="text-[11px] text-slate-500">{getDonationJourneyLabel(r.journey_type ?? "")}</p>
        <p className="mt-1 max-w-[140px] truncate text-[11px] text-slate-600" title={formatToyItemsLine(r)}>
          {formatToyItemsLine(r)}
        </p>
      </td>
      <td className="px-2 py-2">
        <div className="flex items-center gap-1 text-[11px] font-bold text-[#581c87]">
          <Truck className="size-3.5 shrink-0 text-[#9333EA]" aria-hidden />
          איסוף
        </div>
        <div className="mt-1 grid gap-1">
          <Input
            type="date"
            className="h-8 rounded-lg border-slate-200 text-[11px]"
            value={r.pickup_date ?? ""}
            onChange={async (e) => {
              await onUpdate(r.id, { pickup_date: e.target.value || null });
            }}
            aria-label="תאריך איסוף"
          />
          <Input
            type="time"
            className="h-8 rounded-lg border-slate-200 text-[11px]"
            value={formatTime(r.pickup_time)}
            onChange={async (e) => {
              await onUpdate(r.id, { pickup_time: e.target.value || null });
            }}
            aria-label="שעת איסוף"
          />
          <Input
            className="h-8 rounded-lg border-slate-200 text-[11px]"
            placeholder="כתובת איסוף"
            value={addr}
            onChange={(e) => setAddr(e.target.value)}
            onBlur={async () => {
              if (addr !== (r.pickup_address ?? r.address ?? "")) await onUpdate(r.id, { pickup_address: addr || null });
            }}
            aria-label="כתובת איסוף"
          />
          <p className="text-[10px] text-slate-500">מהטופס: {r.scheduled_slot || "—"}</p>
        </div>
        <span className={cn("mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold", badgePickup(r.pickup_status))}>
          {labelPickup(r.pickup_status ?? "pending")}
        </span>
        <select
          className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-1 py-1 text-[11px]"
          value={r.pickup_status ?? "pending"}
          onChange={async (e) => onUpdate(r.id, { pickup_status: e.target.value })}
          aria-label="סטטוס איסוף"
        >
          {PICKUP_STATUS.map((o) => (
            <option key={o} value={o}>
              {labelPickup(o)}
            </option>
          ))}
        </select>
      </td>
      <td className="px-2 py-2">
        <div className="flex items-center gap-1 text-[11px] font-bold text-[#581c87]">
          <Building2 className="size-3.5 shrink-0 text-[#9333EA]" aria-hidden />
          עמותה
        </div>
        <div className="mt-1 grid gap-1">
          <Input
            className="h-8 rounded-lg border-slate-200 text-[11px]"
            placeholder="שם העמותה"
            value={ngoName}
            onChange={(e) => setNgoName(e.target.value)}
            onBlur={async () => {
              if (ngoName !== (r.target_ngo_name ?? "")) await onUpdate(r.id, { target_ngo_name: ngoName || null });
            }}
            aria-label="שם עמותה"
          />
          <Input
            className="h-8 rounded-lg border-slate-200 text-[11px]"
            placeholder="עיר"
            value={ngoCity}
            onChange={(e) => setNgoCity(e.target.value)}
            onBlur={async () => {
              if (ngoCity !== (r.target_ngo_city ?? "")) await onUpdate(r.id, { target_ngo_city: ngoCity || null });
            }}
            aria-label="עיר עמותה"
          />
          <Input
            type="datetime-local"
            className="h-8 rounded-lg border-slate-200 text-[11px]"
            value={deliveryLocalValue(r.delivery_time)}
            onChange={async (e) => {
              const v = e.target.value;
              await onUpdate(r.id, { delivery_time: v ? new Date(v).toISOString() : null });
            }}
            aria-label="זמן הגעה לעמותה"
          />
        </div>
        <span className={cn("mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold", badgeDelivery(r.delivery_status))}>
          {labelDelivery(r.delivery_status ?? "at_warehouse")}
        </span>
        <select
          className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-1 py-1 text-[11px]"
          value={r.delivery_status ?? "at_warehouse"}
          onChange={async (e) => onUpdate(r.id, { delivery_status: e.target.value })}
          aria-label="סטטוס משלוח"
        >
          {DELIVERY_STATUS.map((o) => (
            <option key={o} value={o}>
              {labelDelivery(o)}
            </option>
          ))}
        </select>
      </td>
      <td className="px-2 py-2">
        <Button type="button" size="sm" variant="outline" className="rounded-lg text-[11px]" onClick={() => onQuickView(r)}>
          <Eye className="ms-1 size-3" aria-hidden />
          צפייה
        </Button>
      </td>
    </tr>
  );
}
