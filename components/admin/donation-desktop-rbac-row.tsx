"use client";

import { DonationProgressTrackers } from "@/components/admin/donation-progress-trackers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AdminDashboardRole } from "@/lib/admin-role-types";
import type { AdminDonationPatch, AdminDonationRow } from "@/hooks/useAdminDonations";
import { formatToyItemsLine } from "@/hooks/useAdminDonations";
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

export function DonationDesktopRbacRow({
  r,
  role,
  onUpdate,
  onQuickView,
  variant,
  showProgress,
  colSpan,
}: {
  r: AdminDonationRow;
  role: AdminDashboardRole;
  onUpdate: (id: string, patch: AdminDonationPatch) => Promise<boolean>;
  onQuickView: (row: AdminDonationRow) => void;
  variant: "default" | "all";
  showProgress: boolean;
  colSpan: number;
}) {
  const canLog = role === "admin" || role === "driver";
  const canOffice = role === "admin" || role === "office";
  const canPay = role === "admin";
  const [fn, setFn] = useState(r.first_name ?? "");
  const [ln, setLn] = useState(r.last_name ?? "");
  const loc = (r.pickup_location || r.address || "").trim();
  const tel = telHref(r.phone);

  useEffect(() => {
    setFn(r.first_name ?? "");
    setLn(r.last_name ?? "");
  }, [r.id, r.first_name, r.last_name]);

  return (
    <>
      <tr className="align-top text-[11px] hover:bg-violet-50/40">
        <td className="px-2 py-2 font-medium text-slate-900">{r.child_name || "—"}</td>
        <td className="max-w-[100px] truncate px-2 py-2 text-slate-600" title={formatToyItemsLine(r)}>
          {formatToyItemsLine(r)}
        </td>
        <td className="px-2 py-2 text-slate-500">{getDonationJourneyLabel(r.journey_type ?? "")}</td>
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
          <div className="grid gap-0.5 text-[10px]">
            <span>{r.pickup_date || "—"}</span>
            <span>{fmtTime(r.pickup_time) || "—"}</span>
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
            <select className="w-full rounded-lg border border-slate-200 px-1 py-1" value={r.letter_status ?? "pending"} onChange={(e) => void onUpdate(r.id, { letter_status: e.target.value })}>
              {LETTER_OPTS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          ) : (
            <span>{r.letter_status}</span>
          )}
        </td>
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
            <select className="w-full rounded-lg border px-1 py-1" value={r.payment_status ?? "pending"} onChange={(e) => void onUpdate(r.id, { payment_status: e.target.value })}>
              <option value="pending">ממתין</option>
              <option value="completed">שולם</option>
              <option value="cancelled">בוטל</option>
            </select>
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
          <td colSpan={colSpan} className="px-2 py-2">
            <DonationProgressTrackers r={r} />
          </td>
        </tr>
      ) : null}
    </>
  );
}
