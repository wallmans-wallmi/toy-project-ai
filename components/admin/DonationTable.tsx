"use client";

import type { AdminDonationRow } from "@/hooks/useAdminDonations";
import { formatToyItemsLine } from "@/hooks/useAdminDonations";
import { Button } from "@/components/ui/button";
import { getDonationJourneyLabel } from "@/lib/donation-journey";
import { cn } from "@/lib/utils";
import { Eye } from "lucide-react";

const PAYMENT_OPTIONS = ["pending", "completed", "cancelled"] as const;
const LETTER_OPTIONS = ["pending", "generated", "sent", "completed", "failed"] as const;

function paymentBadgeClass(v: string | null | undefined): string {
  switch (v) {
    case "completed":
      return "bg-emerald-100 text-emerald-900 ring-1 ring-emerald-200";
    case "cancelled":
      return "bg-rose-100 text-rose-900 ring-1 ring-rose-200";
    default:
      return "bg-amber-100 text-amber-950 ring-1 ring-amber-200";
  }
}

function letterBadgeClass(v: string | null | undefined): string {
  switch (v) {
    case "failed":
      return "bg-red-100 text-red-900 ring-1 ring-red-200";
    case "pending":
      return "bg-amber-100 text-amber-950 ring-1 ring-amber-200";
    case "generated":
    case "sent":
    case "completed":
      return "bg-pink-100 text-pink-950 ring-1 ring-pink-300";
    default:
      return "bg-slate-100 text-slate-700 ring-1 ring-slate-200";
  }
}

function labelPayment(v: string) {
  if (v === "completed") return "שולם";
  if (v === "cancelled") return "בוטל";
  return "תשלום ממתין";
}

function labelLetter(v: string) {
  const map: Record<string, string> = {
    pending: "מכתב ממתין",
    generated: "נוצר",
    sent: "נשלח",
    completed: "הושלם",
    failed: "נכשל",
  };
  return map[v] ?? v;
}

type DonationTableProps = {
  rows: AdminDonationRow[];
  onUpdate: (id: string, patch: { payment_status?: string; letter_status?: string }) => Promise<boolean>;
  onQuickView: (row: AdminDonationRow) => void;
  onExport: () => void;
};

export function DonationTable({ rows, onUpdate, onQuickView, onExport }: DonationTableProps) {
  return (
    <div className="space-y-4" dir="rtl" lang="he">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-[16px] font-bold text-slate-900">רשימת תרומות</h2>
          <p className="text-[12px] text-slate-600">{rows.length} רשומות במסך</p>
        </div>
        <Button
          type="button"
          variant="outline"
          className="rounded-xl border-[#9333EA]/40 text-[13px] font-semibold text-[#581c87]"
          onClick={onExport}
          disabled={rows.length === 0}
        >
          ייצוא ל־CSV
        </Button>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#9333EA]/25 bg-white px-6 py-12 text-center">
          <p className="text-[16px] font-bold text-slate-800">עדיין אין בקשות להצגה</p>
          <p className="mt-2 text-[12px] leading-relaxed text-slate-600">
            כשיתחילו להגיע תרומות מהטופס הן יופיעו כאן מסודרות מהחדש לישן
          </p>
        </div>
      ) : null}

      <div className="hidden overflow-x-auto rounded-2xl border border-[#9333EA]/15 bg-white shadow-sm lg:block">
        <table className="w-full min-w-[920px] text-start text-[13px]">
          <thead className="bg-[#F9F5FF] text-[12px] font-bold text-slate-700">
            <tr>
              <th className="px-3 py-3">תאריך</th>
              <th className="px-3 py-3">ילד</th>
              <th className="px-3 py-3">מסלול</th>
              <th className="px-3 py-3">פריטים</th>
              <th className="px-3 py-3">תשלום</th>
              <th className="px-3 py-3">מכתב</th>
              <th className="px-3 py-3 w-28">פעולות</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-violet-50/40">
                <td className="px-3 py-2 whitespace-nowrap text-slate-800">
                  {new Date(r.created_at).toLocaleString("he-IL", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </td>
                <td className="px-3 py-2 font-medium text-slate-900">{r.child_name || "—"}</td>
                <td className="px-3 py-2 text-slate-700">{getDonationJourneyLabel(r.journey_type ?? "")}</td>
                <td className="max-w-[220px] px-3 py-2 text-[12px] text-slate-600 truncate" title={formatToyItemsLine(r)}>
                  {formatToyItemsLine(r)}
                </td>
                <td className="px-3 py-2">
                  <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold", paymentBadgeClass(r.payment_status))}>
                    {labelPayment(r.payment_status ?? "pending")}
                  </span>
                  <select
                    className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-[12px]"
                    value={r.payment_status ?? "pending"}
                    onChange={async (e) => {
                      await onUpdate(r.id, { payment_status: e.target.value });
                    }}
                    aria-label="סטטוס תשלום"
                  >
                    {PAYMENT_OPTIONS.map((o) => (
                      <option key={o} value={o}>
                        {labelPayment(o)}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-3 py-2">
                  <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold", letterBadgeClass(r.letter_status))}>
                    {labelLetter(r.letter_status ?? "pending")}
                  </span>
                  <select
                    className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-[12px]"
                    value={r.letter_status ?? "pending"}
                    onChange={async (e) => {
                      await onUpdate(r.id, { letter_status: e.target.value });
                    }}
                    aria-label="סטטוס מכתב"
                  >
                    {LETTER_OPTIONS.map((o) => (
                      <option key={o} value={o}>
                        {labelLetter(o)}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-3 py-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="rounded-lg border-[#9333EA]/30 text-[12px]"
                    onClick={() => onQuickView(r)}
                  >
                    <Eye className="ms-1 size-3.5" aria-hidden />
                    צפייה
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 lg:hidden">
        {rows.map((r) => (
          <article
            key={r.id}
            className="rounded-2xl border border-[#9333EA]/15 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[16px] font-bold text-slate-900">{r.child_name || "ללא שם ילד"}</p>
                <p className="text-[12px] text-slate-500">
                  {new Date(r.created_at).toLocaleString("he-IL", { dateStyle: "short", timeStyle: "short" })}
                </p>
              </div>
              <Button type="button" size="sm" variant="outline" className="shrink-0 rounded-lg text-[12px]" onClick={() => onQuickView(r)}>
                <Eye className="size-3.5" aria-hidden />
              </Button>
            </div>
            <p className="mt-2 text-[12px] text-slate-700">{getDonationJourneyLabel(r.journey_type ?? "")}</p>
            <p className="mt-1 text-[12px] leading-snug text-slate-600">{formatToyItemsLine(r)}</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div>
                <span className={cn("inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold", paymentBadgeClass(r.payment_status))}>
                  {labelPayment(r.payment_status ?? "pending")}
                </span>
                <select
                  className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-[12px]"
                  value={r.payment_status ?? "pending"}
                  onChange={async (e) => onUpdate(r.id, { payment_status: e.target.value })}
                  aria-label="סטטוס תשלום"
                >
                  {PAYMENT_OPTIONS.map((o) => (
                    <option key={o} value={o}>
                      {labelPayment(o)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <span className={cn("inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold", letterBadgeClass(r.letter_status))}>
                  {labelLetter(r.letter_status ?? "pending")}
                </span>
                <select
                  className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-[12px]"
                  value={r.letter_status ?? "pending"}
                  onChange={async (e) => onUpdate(r.id, { letter_status: e.target.value })}
                  aria-label="סטטוס מכתב"
                >
                  {LETTER_OPTIONS.map((o) => (
                    <option key={o} value={o}>
                      {labelLetter(o)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
