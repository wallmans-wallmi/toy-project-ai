"use client";

import type { AdminDonationPatch, AdminDonationRow } from "@/hooks/useAdminDonations";
import { formatToyItemsLine } from "@/hooks/useAdminDonations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getDonationJourneyLabel } from "@/lib/donation-journey";
import { cn } from "@/lib/utils";
import { Eye } from "lucide-react";
import { useEffect, useState } from "react";

const LETTER_OPTIONS = ["pending", "generated", "sent", "completed", "failed"] as const;
const PAYMENT_OPTIONS = ["pending", "completed", "cancelled"] as const;

function fmtTime(t: string | null | undefined) {
  if (!t) return "";
  return t.length >= 5 ? t.slice(0, 5) : t;
}

function labelLetter(v: string) {
  const m: Record<string, string> = {
    pending: "ממתין",
    generated: "נוצר",
    sent: "נשלח",
    completed: "הושלם",
    failed: "נכשל",
  };
  return m[v] ?? v;
}

function labelPayment(v: string) {
  if (v === "completed") return "שולם";
  if (v === "cancelled") return "בוטל";
  return "ממתין";
}

function letterBadge(v: string | null | undefined) {
  switch (v) {
    case "sent":
    case "completed":
      return "bg-pink-100 text-pink-950 ring-1 ring-pink-300";
    case "failed":
      return "bg-red-100 text-red-900 ring-1 ring-red-200";
    default:
      return "bg-amber-100 text-amber-950 ring-1 ring-amber-200";
  }
}

type Props = {
  rows: AdminDonationRow[];
  onUpdate: (id: string, patch: AdminDonationPatch) => Promise<boolean>;
  onQuickView: (row: AdminDonationRow) => void;
  onExport: () => void;
};

function DesktopRow({
  r,
  onUpdate,
  onQuickView,
}: {
  r: AdminDonationRow;
  onUpdate: (id: string, patch: AdminDonationPatch) => Promise<boolean>;
  onQuickView: (row: AdminDonationRow) => void;
}) {
  const [loc, setLoc] = useState(r.pickup_location ?? "");
  const [ngo, setNgo] = useState(r.ngo_name ?? "");

  useEffect(() => {
    setLoc(r.pickup_location ?? "");
  }, [r.id, r.pickup_location]);

  useEffect(() => {
    setNgo(r.ngo_name ?? "");
  }, [r.id, r.ngo_name]);

  return (
    <tr className="align-top text-[12px] hover:bg-violet-50/40">
      <td className="whitespace-nowrap px-2 py-2 text-slate-800">
        {new Date(r.created_at).toLocaleString("he-IL", { dateStyle: "short", timeStyle: "short" })}
      </td>
      <td className="px-2 py-2 font-medium text-slate-900">{r.child_name || "—"}</td>
      <td className="max-w-[100px] truncate px-2 py-2 text-slate-600" title={formatToyItemsLine(r)}>
        {formatToyItemsLine(r)}
      </td>
      <td className="px-2 py-2">
        <div className="grid max-w-[200px] gap-1">
          <Input type="date" className="h-8 rounded-lg border-slate-200 text-[11px]" value={r.pickup_date ?? ""} onChange={(e) => void onUpdate(r.id, { pickup_date: e.target.value || null })} aria-label="תאריך איסוף" />
          <Input type="time" className="h-8 rounded-lg border-slate-200 text-[11px]" value={fmtTime(r.pickup_time)} onChange={(e) => void onUpdate(r.id, { pickup_time: e.target.value || null })} aria-label="שעת איסוף" />
          <Input
            className="h-8 rounded-lg border-slate-200 text-[11px]"
            placeholder="מיקום איסוף"
            value={loc}
            onChange={(e) => setLoc(e.target.value)}
            onBlur={() => {
              if (loc !== (r.pickup_location ?? "")) void onUpdate(r.id, { pickup_location: loc || null });
            }}
            aria-label="מיקום איסוף"
          />
        </div>
      </td>
      <td className="px-2 py-2">
        <div className="flex flex-col gap-1">
          <Button type="button" size="sm" variant={r.pickup_status === "pending" ? "default" : "outline"} className={cn("h-8 text-[11px]", r.pickup_status === "pending" && "bg-[#9333EA]")} onClick={() => void onUpdate(r.id, { pickup_status: "pending" })}>
            ממתין לאיסוף
          </Button>
          <Button type="button" size="sm" variant={r.pickup_status === "picked_up" ? "default" : "outline"} className={cn("h-8 text-[11px]", r.pickup_status === "picked_up" && "bg-emerald-600")} onClick={() => void onUpdate(r.id, { pickup_status: "picked_up" })}>
            נאסף
          </Button>
        </div>
      </td>
      <td className="px-2 py-2">
        <div className="flex max-w-[220px] flex-col gap-1">
          <Button type="button" size="sm" variant={r.delivery_status === "delivered" ? "default" : "outline"} className={cn("h-8 text-[11px]", r.delivery_status === "delivered" && "bg-[#581c87]")} onClick={() => void onUpdate(r.id, { delivery_status: "delivered" })}>
            הגיע לעמותה
          </Button>
          <Button type="button" size="sm" variant="outline" className="h-8 text-[11px]" onClick={() => void onUpdate(r.id, { delivery_status: "sent_to_ngo" })}>
            בדרך לעמותה
          </Button>
          <Button type="button" size="sm" variant="outline" className="h-8 text-[11px]" onClick={() => void onUpdate(r.id, { delivery_status: "at_warehouse" })}>
            במחסן
          </Button>
          <Input
            className="h-8 rounded-lg border-slate-200 text-[11px]"
            placeholder="שם העמותה"
            value={ngo}
            onChange={(e) => setNgo(e.target.value)}
            onBlur={() => {
              if (ngo !== (r.ngo_name ?? "")) void onUpdate(r.id, { ngo_name: ngo || null });
            }}
            aria-label="שם עמותה"
          />
        </div>
      </td>
      <td className="px-2 py-2">
        <span className={cn("inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold", letterBadge(r.letter_status))}>{labelLetter(r.letter_status ?? "pending")}</span>
        <select className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-1 py-1 text-[11px]" value={r.letter_status ?? "pending"} onChange={(e) => void onUpdate(r.id, { letter_status: e.target.value })} aria-label="סטטוס מכתב">
          {LETTER_OPTIONS.map((o) => (
            <option key={o} value={o}>
              {labelLetter(o)}
            </option>
          ))}
        </select>
      </td>
      <td className="px-2 py-2">
        <select className="block w-full rounded-lg border border-slate-200 px-1 py-1 text-[11px]" value={r.payment_status ?? "pending"} onChange={(e) => void onUpdate(r.id, { payment_status: e.target.value })} aria-label="תשלום">
          {PAYMENT_OPTIONS.map((o) => (
            <option key={o} value={o}>
              {labelPayment(o)}
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

function MobileShipCard({
  r,
  onUpdate,
  onQuickView,
}: {
  r: AdminDonationRow;
  onUpdate: (id: string, patch: AdminDonationPatch) => Promise<boolean>;
  onQuickView: (row: AdminDonationRow) => void;
}) {
  const [loc, setLoc] = useState(r.pickup_location ?? "");
  const [ngo, setNgo] = useState(r.ngo_name ?? "");

  useEffect(() => {
    setLoc(r.pickup_location ?? "");
  }, [r.id, r.pickup_location]);

  useEffect(() => {
    setNgo(r.ngo_name ?? "");
  }, [r.id, r.ngo_name]);

  return (
    <article className="rounded-2xl border border-[#9333EA]/20 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[15px] font-bold text-slate-900">{r.child_name || "ללא שם"}</p>
          <p className="text-[11px] text-slate-500">{getDonationJourneyLabel(r.journey_type ?? "")}</p>
          <p className="text-[11px] text-slate-400">{new Date(r.created_at).toLocaleString("he-IL", { dateStyle: "short", timeStyle: "short" })}</p>
        </div>
        <Button type="button" size="sm" variant="outline" className="shrink-0 rounded-lg" onClick={() => onQuickView(r)}>
          <Eye className="size-3.5" aria-hidden />
        </Button>
      </div>
      <p className="mt-1 text-[11px] text-slate-600">{formatToyItemsLine(r)}</p>

      <section className="mt-3 rounded-xl bg-[#F9F5FF] p-3" aria-label="איסוף">
        <p className="text-[12px] font-bold text-[#581c87]">איסוף — תאריך, שעה ומיקום</p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <Input type="date" className="h-10 rounded-xl border-slate-200 text-[12px]" value={r.pickup_date ?? ""} onChange={(e) => void onUpdate(r.id, { pickup_date: e.target.value || null })} />
          <Input type="time" className="h-10 rounded-xl border-slate-200 text-[12px]" value={fmtTime(r.pickup_time)} onChange={(e) => void onUpdate(r.id, { pickup_time: e.target.value || null })} />
        </div>
        <Input
          className="mt-2 h-10 rounded-xl border-slate-200 text-[12px]"
          placeholder="מיקום איסוף"
          value={loc}
          onChange={(e) => setLoc(e.target.value)}
          onBlur={() => {
            if (loc !== (r.pickup_location ?? "")) void onUpdate(r.id, { pickup_location: loc || null });
          }}
        />
        <p className="mt-1 text-[10px] text-slate-500">מהטופס: {r.scheduled_slot || "—"}</p>
        <div className="mt-2 flex gap-2">
          <Button type="button" className={cn("flex-1 rounded-xl text-[12px] font-bold", r.pickup_status === "pending" ? "bg-[#9333EA] text-white" : "border border-[#9333EA]/30 bg-white")} variant={r.pickup_status === "pending" ? "default" : "outline"} onClick={() => void onUpdate(r.id, { pickup_status: "pending" })}>
            ממתין
          </Button>
          <Button type="button" className={cn("flex-1 rounded-xl text-[12px] font-bold", r.pickup_status === "picked_up" ? "bg-emerald-600 text-white" : "border border-emerald-200 bg-white")} variant={r.pickup_status === "picked_up" ? "default" : "outline"} onClick={() => void onUpdate(r.id, { pickup_status: "picked_up" })}>
            נאסף
          </Button>
        </div>
      </section>

      <section className="mt-3 rounded-xl border border-[#9333EA]/15 p-3" aria-label="משלוח לעמותה">
        <p className="text-[12px] font-bold text-[#581c87]">סטטוס משלוח + עמותה</p>
        <div className="mt-2 flex flex-col gap-2">
          <Button type="button" className={cn("h-10 rounded-xl text-[12px] font-bold", r.delivery_status === "delivered" ? "bg-[#581c87] text-white" : "border border-[#9333EA]/30")} variant={r.delivery_status === "delivered" ? "default" : "outline"} onClick={() => void onUpdate(r.id, { delivery_status: "delivered" })}>
            סימנתי: הגיע לעמותה
          </Button>
          <div className="flex gap-2">
            <Button type="button" variant="outline" className="flex-1 rounded-xl text-[11px]" onClick={() => void onUpdate(r.id, { delivery_status: "at_warehouse" })}>
              במחסן
            </Button>
            <Button type="button" variant="outline" className="flex-1 rounded-xl text-[11px]" onClick={() => void onUpdate(r.id, { delivery_status: "sent_to_ngo" })}>
              בדרך
            </Button>
          </div>
          <Input
            className="h-10 rounded-xl border-slate-200 text-[12px]"
            placeholder="שם העמותה"
            value={ngo}
            onChange={(e) => setNgo(e.target.value)}
            onBlur={() => {
              if (ngo !== (r.ngo_name ?? "")) void onUpdate(r.id, { ngo_name: ngo || null });
            }}
          />
        </div>
      </section>

      <section className="mt-3 rounded-xl border border-slate-100 p-3" aria-label="מכתב">
        <p className="text-[12px] font-bold text-slate-800">סטטוס מכתב</p>
        <select className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-[13px]" value={r.letter_status ?? "pending"} onChange={(e) => void onUpdate(r.id, { letter_status: e.target.value })}>
          {LETTER_OPTIONS.map((o) => (
            <option key={o} value={o}>
              {labelLetter(o)}
            </option>
          ))}
        </select>
      </section>

      <section className="mt-3 rounded-xl border border-slate-100 p-3">
        <p className="text-[12px] font-bold text-slate-800">תשלום</p>
        <select className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-[13px]" value={r.payment_status ?? "pending"} onChange={(e) => void onUpdate(r.id, { payment_status: e.target.value })}>
          {PAYMENT_OPTIONS.map((o) => (
            <option key={o} value={o}>
              {labelPayment(o)}
            </option>
          ))}
        </select>
      </section>
    </article>
  );
}

export function DonationAdminUnifiedTable({ rows, onUpdate, onQuickView, onExport }: Props) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-[16px] font-bold text-slate-900">תרומות ולוגיסטיקה</h2>
          <p className="text-[12px] text-slate-600">{rows.length} רשומות — איסוף, משלוח, מכתב ותשלום במקום אחד</p>
        </div>
        <Button type="button" variant="outline" className="rounded-xl border-[#9333EA]/40 text-[13px] font-semibold text-[#581c87]" onClick={onExport} disabled={rows.length === 0}>
          ייצוא ל־CSV
        </Button>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#9333EA]/25 bg-white px-6 py-12 text-center">
          <p className="text-[16px] font-bold text-slate-800">עדיין אין בקשות</p>
          <p className="mt-2 text-[12px] text-slate-600">כשיגיעו תרומות מהאתר — יופיעו כאן עם כל שדות הלוגיסטיקה</p>
        </div>
      ) : null}

      <div className="hidden overflow-x-auto rounded-2xl border border-[#9333EA]/15 bg-white shadow-sm lg:block">
        <table className="w-full min-w-[1100px] text-start">
          <thead className="bg-[#F9F5FF] text-[11px] font-bold text-slate-700">
            <tr>
              <th className="px-2 py-2">נוצר</th>
              <th className="px-2 py-2">ילד</th>
              <th className="px-2 py-2">פריטים</th>
              <th className="px-2 py-2">איסוף</th>
              <th className="px-2 py-2">סטטוס איסוף</th>
              <th className="px-2 py-2">משלוח + עמותה</th>
              <th className="px-2 py-2">מכתב</th>
              <th className="px-2 py-2">תשלום</th>
              <th className="w-20 px-2 py-2">פעולות</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((r) => (
              <DesktopRow key={r.id} r={r} onUpdate={onUpdate} onQuickView={onQuickView} />
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-4 lg:hidden">
        <p className="text-center text-[11px] font-semibold text-[#581c87]">כרטיס משלוח — עדכון מהשטח</p>
        {rows.map((r) => (
          <MobileShipCard key={r.id} r={r} onUpdate={onUpdate} onQuickView={onQuickView} />
        ))}
      </div>
    </div>
  );
}
