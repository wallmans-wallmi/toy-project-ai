"use client";

import { DonationProgressTrackers } from "@/components/admin/donation-progress-trackers";
import type { AdminDashboardRole } from "@/lib/admin-role-types";
import type { AdminDonationPatch, AdminDonationRow } from "@/hooks/useAdminDonations";
import { formatToyItemsLine } from "@/hooks/useAdminDonations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getDonationJourneyLabel } from "@/lib/donation-journey";
import { cn } from "@/lib/utils";
import { Eye, MapPin, Phone } from "lucide-react";
import { useEffect, useState } from "react";

const LETTER_OPTS = ["pending", "generated", "sent", "completed", "failed"] as const;

function mapsQuery(r: AdminDonationRow): string {
  return (r.pickup_location || r.address || "").trim();
}

function telHref(phone: string | null | undefined): string {
  if (!phone) return "";
  const d = phone.replace(/[^\d+]/g, "");
  return d ? `tel:${d}` : "";
}

function mapsUrl(q: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
}

function lblLetter(v: string) {
  const m: Record<string, string> = { pending: "ממתין", sent: "נשלח", completed: "הושלם", failed: "נכשל", generated: "נוצר" };
  return m[v] ?? v;
}

type Props = {
  r: AdminDonationRow;
  role: AdminDashboardRole;
  onUpdate: (id: string, patch: AdminDonationPatch) => Promise<boolean>;
  onQuickView: (row: AdminDonationRow) => void;
  showProgress?: boolean;
};

export function DonationMobileCard({ r, role, onUpdate, onQuickView, showProgress = true }: Props) {
  const canLogistics = role === "admin" || role === "driver";
  const canOfficeFields = role === "admin" || role === "office";
  const canPayment = role === "admin";
  const [fn, setFn] = useState(r.first_name ?? "");
  const [ln, setLn] = useState(r.last_name ?? "");
  const [ph, setPh] = useState(r.phone ?? "");

  useEffect(() => {
    setFn(r.first_name ?? "");
    setLn(r.last_name ?? "");
    setPh(r.phone ?? "");
  }, [r.id, r.first_name, r.last_name, r.phone]);

  const mq = mapsQuery(r);
  const tel = telHref(r.phone);

  return (
    <article className="rounded-2xl border border-[#9333EA]/20 bg-white p-4 shadow-sm">
      {showProgress ? (
        <div className="mb-3">
          <DonationProgressTrackers r={r} />
        </div>
      ) : null}
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[15px] font-bold text-slate-900">{r.child_name || "ללא שם ילד"}</p>
          <p className="text-[11px] text-slate-500">{getDonationJourneyLabel(r.journey_type ?? "")}</p>
        </div>
        <Button type="button" size="sm" variant="outline" className="shrink-0 rounded-lg" onClick={() => onQuickView(r)}>
          <Eye className="size-3.5" aria-hidden />
        </Button>
      </div>
      <p className="mt-1 text-[11px] text-slate-600">{formatToyItemsLine(r)}</p>

      <div className="mt-3 flex flex-wrap gap-2">
        {tel ? (
          <a
            href={tel}
            className="inline-flex h-10 min-w-[120px] flex-1 items-center justify-center gap-1 rounded-xl bg-[#9333EA] text-[12px] font-bold text-white shadow-sm transition-colors hover:bg-[#7c3aed]"
          >
            <Phone className="size-4" aria-hidden />
            חיוג מהיר
          </a>
        ) : null}
        {mq ? (
          <a
            href={mapsUrl(mq)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 min-w-[120px] flex-1 items-center justify-center gap-1 rounded-xl border border-[#9333EA]/40 bg-white text-[12px] font-bold text-[#581c87] transition-colors hover:bg-[#F9F5FF]"
          >
            <MapPin className="size-4" aria-hidden />
            ניווט
          </a>
        ) : null}
      </div>

      {canLogistics ? (
        <div className="mt-3 rounded-xl bg-[#F9F5FF] p-3">
          <p className="text-[12px] font-bold text-[#581c87]">סטטוסים — בלחיצה גסה כי אנחנו בדרכים</p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <Button type="button" className={cn("h-12 rounded-xl text-[13px] font-bold", (r.pickup_status ?? "pending") === "pending" ? "bg-[#9333EA] text-white" : "border border-[#9333EA]/30 bg-white")} variant={(r.pickup_status ?? "pending") === "pending" ? "default" : "outline"} onClick={() => void onUpdate(r.id, { pickup_status: "pending" })}>
              ממתין לאיסוף
            </Button>
            <Button type="button" className={cn("h-12 rounded-xl text-[13px] font-bold", r.pickup_status === "picked_up" ? "bg-emerald-600 text-white" : "border border-emerald-200 bg-white")} variant={r.pickup_status === "picked_up" ? "default" : "outline"} onClick={() => void onUpdate(r.id, { pickup_status: "picked_up" })}>
              נאסף
            </Button>
          </div>
          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
            <Button type="button" className="h-11 rounded-xl text-[12px] font-bold" variant={(r.delivery_status ?? "") === "at_warehouse" ? "default" : "outline"} onClick={() => void onUpdate(r.id, { delivery_status: "at_warehouse" })}>
              במחסן
            </Button>
            <Button type="button" className="h-11 rounded-xl text-[12px] font-bold" variant={r.delivery_status === "sent_to_ngo" ? "default" : "outline"} onClick={() => void onUpdate(r.id, { delivery_status: "sent_to_ngo" })}>
              בדרך לעמותה
            </Button>
            <Button type="button" className="h-11 rounded-xl text-[12px] font-bold" variant={r.delivery_status === "delivered" ? "default" : "outline"} onClick={() => void onUpdate(r.id, { delivery_status: "delivered" })}>
              הגיע ליעד
            </Button>
          </div>
        </div>
      ) : null}

      {canOfficeFields ? (
        <div className="mt-3 space-y-2 rounded-xl border border-slate-100 p-3">
          <p className="text-[12px] font-bold text-slate-800">משרד — מכתב ותורם</p>
          <Label className="text-[10px] text-slate-600">סטטוס מכתב</Label>
          <select className="w-full rounded-xl border border-slate-200 px-3 py-2 text-[13px]" value={r.letter_status ?? "pending"} onChange={(e) => void onUpdate(r.id, { letter_status: e.target.value })}>
            {LETTER_OPTS.map((o) => (
              <option key={o} value={o}>
                {lblLetter(o)}
              </option>
            ))}
          </select>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div>
              <Label className="text-[10px]">שם פרטי</Label>
              <Input className="mt-0.5 h-9 rounded-lg text-[12px]" value={fn} onChange={(e) => setFn(e.target.value)} onBlur={() => void (fn !== (r.first_name ?? "") && onUpdate(r.id, { first_name: fn || null }))} />
            </div>
            <div>
              <Label className="text-[10px]">שם משפחה</Label>
              <Input className="mt-0.5 h-9 rounded-lg text-[12px]" value={ln} onChange={(e) => setLn(e.target.value)} onBlur={() => void (ln !== (r.last_name ?? "") && onUpdate(r.id, { last_name: ln || null }))} />
            </div>
          </div>
          <div>
            <Label className="text-[10px]">טלפון</Label>
            <Input className="mt-0.5 h-9 rounded-lg text-[12px]" value={ph} onChange={(e) => setPh(e.target.value)} onBlur={() => void (ph !== (r.phone ?? "") && onUpdate(r.id, { phone: ph || null }))} />
          </div>
        </div>
      ) : null}

      {canPayment ? (
        <div className="mt-3 rounded-xl border border-slate-100 p-3">
          <Label className="text-[11px] font-bold">תשלום</Label>
          <select className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-[13px]" value={r.payment_status ?? "pending"} onChange={(e) => void onUpdate(r.id, { payment_status: e.target.value })}>
            <option value="pending">ממתין</option>
            <option value="completed">שולם</option>
            <option value="cancelled">בוטל</option>
          </select>
        </div>
      ) : null}
    </article>
  );
}
