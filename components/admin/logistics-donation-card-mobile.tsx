"use client";

import { AdminResponsiveFieldSelect } from "@/components/admin/admin-responsive-select";
import type { AdminDonationPatch, AdminDonationRow } from "@/hooks/useAdminDonations";
import { formatToyItemsLine } from "@/hooks/useAdminDonations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

const PICKUP_FIELD_OPTIONS = PICKUP_STATUS.map((o) => ({ value: o, label: labelPickup(o) }));
const DELIVERY_FIELD_OPTIONS = DELIVERY_STATUS.map((o) => ({ value: o, label: labelDelivery(o) }));

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

export function LogisticsDonationCardMobile({
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
    <article className="rounded-2xl border border-[#9333EA]/15 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[15px] font-bold text-slate-900">{r.child_name || "ללא שם"}</p>
          <p className="text-[11px] text-slate-500">{getDonationJourneyLabel(r.journey_type ?? "")}</p>
        </div>
        <Button type="button" size="sm" variant="outline" className="shrink-0 rounded-lg text-[11px]" onClick={() => onQuickView(r)}>
          <Eye className="size-3.5" aria-hidden />
        </Button>
      </div>
      <p className="mt-1 text-[11px] text-slate-600">{formatToyItemsLine(r)}</p>

      <div className="mt-3 rounded-xl bg-[#F9F5FF] p-3">
        <div className="flex items-center gap-1.5 text-[12px] font-bold text-[#581c87]">
          <Truck className="size-4 text-[#9333EA]" aria-hidden />
          משלוח איסוף
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <div>
            <Label className="text-[10px] text-slate-600">תאריך</Label>
            <Input
              type="date"
              className="mt-0.5 h-9 rounded-lg border-slate-200 text-[12px]"
              value={r.pickup_date ?? ""}
              onChange={async (e) => onUpdate(r.id, { pickup_date: e.target.value || null })}
            />
          </div>
          <div>
            <Label className="text-[10px] text-slate-600">שעה</Label>
            <Input
              type="time"
              className="mt-0.5 h-9 rounded-lg border-slate-200 text-[12px]"
              value={formatTime(r.pickup_time)}
              onChange={async (e) => onUpdate(r.id, { pickup_time: e.target.value || null })}
            />
          </div>
        </div>
        <Input
          className="mt-2 h-9 rounded-lg border-slate-200 text-[12px]"
          placeholder="כתובת איסוף"
          value={addr}
          onChange={(e) => setAddr(e.target.value)}
          onBlur={async () => {
            if (addr !== (r.pickup_address ?? r.address ?? "")) await onUpdate(r.id, { pickup_address: addr || null });
          }}
        />
        {(r.door_code?.trim() || r.address_notes?.trim()) ? (
          <p className="mt-1 text-[10px] leading-snug text-slate-500">
            {r.door_code?.trim() ? `קוד: ${r.door_code.trim()}` : null}
            {r.door_code?.trim() && r.address_notes?.trim() ? " · " : null}
            {r.address_notes?.trim() ? `הערות לכתובת: ${r.address_notes.trim()}` : null}
          </p>
        ) : null}
        <p className="mt-1 text-[10px] text-slate-500">חלון מהטופס: {r.scheduled_slot || "—"}</p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold", badgePickup(r.pickup_status))}>
            {labelPickup(r.pickup_status ?? "pending")}
          </span>
          <AdminResponsiveFieldSelect
            triggerClassName="min-w-0 flex-1 rounded-lg border border-slate-200 px-2 py-1.5 text-[11px]"
            value={r.pickup_status ?? "pending"}
            onChange={async (next) => onUpdate(r.id, { pickup_status: next })}
            options={PICKUP_FIELD_OPTIONS}
            ariaLabel="סטטוס איסוף"
            sheetTitle="סטטוס איסוף"
            sheetSubtitle="העדכון נשמר מיד בשרת"
          />
        </div>
      </div>

      <div className="mt-3 rounded-xl border border-[#9333EA]/20 p-3">
        <div className="flex items-center gap-1.5 text-[12px] font-bold text-[#581c87]">
          <Building2 className="size-4 text-[#9333EA]" aria-hidden />
          יעד — עמותה
        </div>
        <Input
          className="mt-2 h-9 rounded-lg border-slate-200 text-[12px]"
          placeholder="שם העמותה"
          value={ngoName}
          onChange={(e) => setNgoName(e.target.value)}
          onBlur={async () => {
            if (ngoName !== (r.target_ngo_name ?? "")) await onUpdate(r.id, { target_ngo_name: ngoName || null });
          }}
        />
        <Input
          className="mt-2 h-9 rounded-lg border-slate-200 text-[12px]"
          placeholder="עיר"
          value={ngoCity}
          onChange={(e) => setNgoCity(e.target.value)}
          onBlur={async () => {
            if (ngoCity !== (r.target_ngo_city ?? "")) await onUpdate(r.id, { target_ngo_city: ngoCity || null });
          }}
        />
        <Label className="mt-2 block text-[10px] text-slate-600">זמן הגעה (משוער/בפועל)</Label>
        <Input
          type="datetime-local"
          className="mt-0.5 h-9 rounded-lg border-slate-200 text-[12px]"
          value={deliveryLocalValue(r.delivery_time)}
          onChange={async (e) => {
            const v = e.target.value;
            await onUpdate(r.id, { delivery_time: v ? new Date(v).toISOString() : null });
          }}
        />
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold", badgeDelivery(r.delivery_status))}>
            {labelDelivery(r.delivery_status ?? "at_warehouse")}
          </span>
          <AdminResponsiveFieldSelect
            triggerClassName="min-w-0 flex-1 rounded-lg border border-slate-200 px-2 py-1.5 text-[11px]"
            value={r.delivery_status ?? "at_warehouse"}
            onChange={async (next) => onUpdate(r.id, { delivery_status: next })}
            options={DELIVERY_FIELD_OPTIONS}
            ariaLabel="סטטוס משלוח לעמותה"
            sheetTitle="משלוח לעמותה"
            sheetSubtitle="העדכון נשמר מיד בשרת"
          />
        </div>
      </div>
    </article>
  );
}
