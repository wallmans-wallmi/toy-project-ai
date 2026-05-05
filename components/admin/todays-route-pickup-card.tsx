"use client";

import { DonationProgressTrackers } from "@/components/admin/donation-progress-trackers";
import { Label } from "@/components/ui/label";
import type { AdminDonationPatch, AdminDonationRow } from "@/hooks/useAdminDonations";
import type { AdminDashboardRole } from "@/lib/admin-role-types";
import { toyItemsLinesForRoute } from "@/lib/admin-donation-display";
import { cn } from "@/lib/utils";
import { MapPin, Navigation, Phone } from "lucide-react";

function fmtTime(t: string | null | undefined): string {
  if (!t) return "—";
  return t.length >= 5 ? t.slice(0, 5) : t;
}

function telHref(phone: string | null | undefined): string {
  if (!phone) return "";
  const d = phone.replace(/[^\d+]/g, "");
  return d ? `tel:${d}` : "";
}

function fullPickupAddress(r: AdminDonationRow): string {
  return (r.pickup_address || r.pickup_location || r.address || "").trim();
}

function mapsUrl(q: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
}

function wazeUrl(q: string): string {
  return `https://waze.com/ul?q=${encodeURIComponent(q)}`;
}

function donorFullName(r: AdminDonationRow): string {
  const parts = [r.first_name, r.last_name].filter((x) => x && String(x).trim());
  return parts.length ? parts.join(" ") : "—";
}

function routeStatusSelectValue(r: AdminDonationRow): string {
  if ((r.delivery_status ?? "") === "delivered") return "ngo";
  if ((r.pickup_status ?? "") === "picked_up") return "picked";
  return "waiting";
}

function patchForRouteStatus(v: string): AdminDonationPatch {
  if (v === "waiting") return { pickup_status: "pending", delivery_status: "at_warehouse" };
  if (v === "picked") return { pickup_status: "picked_up", delivery_status: "at_warehouse" };
  return { pickup_status: "picked_up", delivery_status: "delivered" };
}

type Props = {
  r: AdminDonationRow;
  role: AdminDashboardRole;
  onUpdate: (id: string, patch: AdminDonationPatch) => Promise<boolean>;
  showProgress?: boolean;
};

export function TodaysRoutePickupCard({ r, role, onUpdate, showProgress = true }: Props) {
  const canSetRouteStatus = role === "admin" || role === "driver";
  const addr = fullPickupAddress(r);
  const tel = telHref(r.phone);
  const items = toyItemsLinesForRoute(r.toy_items);

  return (
    <article className="rounded-2xl border border-[#9333EA]/25 bg-[#F9F5FF] p-4 shadow-sm" dir="rtl" lang="he">
      <header className="border-b border-[#9333EA]/15 pb-3 text-center">
        <p className="text-[16px] font-bold leading-tight text-[#9333EA]">
          {r.pickup_date ?? "—"} <span className="text-[#581c87]">|</span> {fmtTime(r.pickup_time)}
        </p>
      </header>

      <section className="mt-3 space-y-1 text-start">
        <p className="text-[12px] font-bold text-[#581c87]">שם התורם</p>
        <p className="text-[16px] font-bold text-slate-900">{donorFullName(r)}</p>
      </section>

      <section className="mt-4 text-start">
        <p className="text-[12px] font-bold text-[#581c87]">כתובת איסוף</p>
        <p className="mt-1 text-[12px] leading-relaxed text-slate-800">{addr || "—"}</p>
        {addr ? (
          <div className="mt-2 flex flex-wrap gap-2">
            <a
              href={wazeUrl(addr)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 flex-1 min-w-[120px] items-center justify-center gap-1 rounded-xl border border-[#9333EA]/40 bg-white px-3 text-[12px] font-bold text-[#581c87] shadow-sm transition-colors hover:bg-white"
            >
              <Navigation className="size-3.5 shrink-0" aria-hidden />
              Waze
            </a>
            <a
              href={mapsUrl(addr)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 flex-1 min-w-[120px] items-center justify-center gap-1 rounded-xl border border-[#9333EA]/40 bg-white px-3 text-[12px] font-bold text-[#581c87] shadow-sm transition-colors hover:bg-white"
            >
              <MapPin className="size-3.5 shrink-0" aria-hidden />
              מפה
            </a>
          </div>
        ) : null}
      </section>

      <section className="mt-4 text-start">
        <p className="text-[12px] font-bold text-[#581c87]">מה לאסוף</p>
        {items.length === 0 ? (
          <p className="mt-1 text-[12px] text-slate-600">{r.toy_description?.trim() || "אין פירוט פריטים"}</p>
        ) : (
          <ul className="mt-2 list-disc space-y-1.5 pe-5 text-[12px] text-slate-800">
            {items.map((line, i) => (
              <li key={`${r.id}-item-${i}`} className="marker:text-[#9333EA]">
                {line}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-4 text-start">
        <p className="text-[12px] font-bold text-[#581c87]">יצירת קשר</p>
        {tel ? (
          <a
            href={tel}
            className="mt-2 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#9333EA] text-[12px] font-bold text-white shadow-sm transition-colors hover:bg-[#7c3aed]"
          >
            <Phone className="size-4 shrink-0" aria-hidden />
            חיוג
          </a>
        ) : (
          <p className="mt-1 text-[12px] text-slate-500">אין טלפון ברשומה</p>
        )}
      </section>

      <section className="mt-4 text-start">
        <Label htmlFor={`route-st-${r.id}`} className="text-[12px] font-bold text-[#581c87]">
          סטטוס
        </Label>
        {canSetRouteStatus ? (
          <select
            id={`route-st-${r.id}`}
            className={cn(
              "mt-2 w-full rounded-xl border border-[#9333EA]/30 bg-white px-3 py-2.5 text-[14px] font-bold text-slate-900 outline-none focus:ring-2 focus:ring-[#9333EA]/40",
            )}
            value={routeStatusSelectValue(r)}
            onChange={(e) => void onUpdate(r.id, patchForRouteStatus(e.target.value))}
            aria-label="סטטוס איסוף והגעה לעמותה"
          >
            <option value="waiting">ממתין לאיסוף</option>
            <option value="picked">נאסף</option>
            <option value="ngo">הגיע לעמותה</option>
          </select>
        ) : (
          <p className="mt-2 text-[12px] text-slate-600">
            {(r.pickup_status ?? "pending") === "picked_up" && (r.delivery_status ?? "") === "delivered"
              ? "הגיע לעמותה"
              : (r.pickup_status ?? "") === "picked_up"
                ? "נאסף"
                : "ממתין לאיסוף"}
          </p>
        )}
      </section>

      {showProgress ? (
        <div className="mt-4 rounded-xl border border-[#9333EA]/10 bg-white/80 p-2">
          <DonationProgressTrackers r={r} />
        </div>
      ) : null}
    </article>
  );
}
