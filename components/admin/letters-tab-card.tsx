"use client";

import { AdminResponsiveFieldSelect } from "@/components/admin/admin-responsive-select";
import { DonationProgressTrackers } from "@/components/admin/donation-progress-trackers";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { AdminDonationPatch, AdminDonationRow } from "@/hooks/useAdminDonations";
import { adminPickupDisplayBlock } from "@/lib/admin-donation-address-display";
import { getDonationLetterBody, letterStatusToUi } from "@/lib/admin-letters-queue";
import type { AdminDashboardRole } from "@/lib/admin-role-types";
import { buildLetterWhatsAppUrl } from "@/lib/letter-whatsapp-url";
import { openLetterPrintWindow } from "@/lib/open-letter-print";
import { cn } from "@/lib/utils";
import { Mail, MessageCircle, Printer, ScrollText } from "lucide-react";
import { useState } from "react";

function donorName(r: AdminDonationRow): string {
  return [r.first_name, r.last_name].filter(Boolean).join(" ").trim() || "—";
}

const LETTER_UI_FIELD_OPTIONS = [
  { value: "pending", label: "בהכנה" },
  { value: "generated", label: "ממתין למשלוח" },
  { value: "sent", label: "נשלח" },
];

function fmtWhen(t: string | null | undefined): string {
  if (!t) return "—";
  const d = Date.parse(t);
  if (!Number.isFinite(d)) return t.length > 16 ? t.slice(0, 16) : t;
  return new Intl.DateTimeFormat("he-IL", { dateStyle: "short", timeStyle: "short" }).format(d);
}

type Props = {
  r: AdminDonationRow;
  role: AdminDashboardRole;
  onUpdate: (id: string, patch: AdminDonationPatch) => Promise<boolean>;
  onPreview: (title: string, body: string) => void;
};

export function LettersTabCard({ r, role, onUpdate, onPreview }: Props) {
  const canOffice = role === "admin" || role === "office";
  const [emailBusy, setEmailBusy] = useState(false);
  const [emailErr, setEmailErr] = useState<string | null>(null);
  const [emailOk, setEmailOk] = useState(false);
  const letter = getDonationLetterBody(r);
  const wa = buildLetterWhatsAppUrl(r.phone, letter);
  const ui = letterStatusToUi(r.letter_status);

  async function sendEmail() {
    setEmailErr(null);
    setEmailOk(false);
    setEmailBusy(true);
    try {
      const res = await fetch("/api/admin/letters/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ donationId: r.id }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setEmailErr(data.error ?? "לא נשלח");
        return;
      }
      setEmailOk(true);
    } finally {
      setEmailBusy(false);
    }
  }

  return (
    <article className="rounded-2xl border border-[#9333EA]/20 bg-[#F9F5FF] p-4 shadow-sm" dir="rtl" lang="he">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#9333EA]/10 pb-3">
        <p className="text-[12px] font-bold text-[#581c87]">תור מכתבים</p>
        <span
          className={cn(
            "rounded-full px-2.5 py-0.5 text-[11px] font-bold",
            ui === "sent" ? "bg-[#ec4899]/25 text-[#9d174d]" : ui === "generated" ? "bg-[#ec4899] text-white" : "bg-white text-[#9333EA] ring-1 ring-[#9333EA]/30",
          )}
        >
          {ui === "sent" ? "נשלח" : ui === "generated" ? "ממתין למשלוח" : "בהכנה"}
        </span>
      </div>

      <div className="mt-3 space-y-2 text-start">
        <p className="text-[12px] font-bold text-[#581c87]">שם התורם</p>
        <p className="text-[16px] font-bold text-slate-900">{donorName(r)}</p>
        <p className="text-[12px] font-bold text-[#581c87]">כתובת איסוף</p>
        <p className="whitespace-pre-line text-[12px] leading-relaxed text-slate-800">
          {adminPickupDisplayBlock(r).trim() || "—"}
        </p>
        <p className="text-[12px] font-bold text-[#581c87]">זמן הגעה למחסן / עמותה</p>
        <p className="text-[16px] font-bold text-[#9333EA]">{fmtWhen(r.delivery_time)}</p>
      </div>

      {canOffice ? (
        <div className="mt-4">
          <Label htmlFor={`ls-${r.id}`} className="text-[12px] font-bold text-[#581c87]">
            סטטוס מכתב
          </Label>
          <AdminResponsiveFieldSelect
            id={`ls-${r.id}`}
            triggerClassName="mt-2 w-full rounded-xl border border-[#9333EA]/30 bg-white px-3 py-2.5 text-[14px] font-bold text-slate-900 outline-none focus:ring-2 focus:ring-[#9333EA]/40"
            value={ui}
            onChange={(next) => {
              const patch: AdminDonationPatch = { letter_status: next as "pending" | "generated" | "sent" };
              void onUpdate(r.id, patch);
            }}
            options={LETTER_UI_FIELD_OPTIONS}
            ariaLabel="סטטוס מכתב"
            sheetTitle="סטטוס מכתב"
            sheetSubtitle="העדכון נשמר מיד בשרת"
          />
        </div>
      ) : null}

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <Button type="button" variant="outline" className="flex-1 rounded-xl border-[#9333EA]/40 font-bold text-[#581c87]" onClick={() => onPreview(`מכתב — ${donorName(r)}`, letter)}>
          <ScrollText className="size-4 shrink-0" aria-hidden />
          צפייה במכתב
        </Button>
        {wa ? (
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 flex-1 min-w-[140px] items-center justify-center gap-1 rounded-xl bg-[#9333EA] px-3 text-[12px] font-bold text-white shadow-sm transition-colors hover:bg-[#7c3aed]"
          >
            <MessageCircle className="size-4 shrink-0" aria-hidden />
            WhatsApp
          </a>
        ) : null}
        {canOffice ? (
          <Button type="button" variant="outline" disabled={emailBusy} className="flex-1 rounded-xl border-[#9333EA]/40 font-bold text-[#581c87]" onClick={() => void sendEmail()}>
            <Mail className="size-4 shrink-0" aria-hidden />
            {emailBusy ? "שולחים…" : "מייל"}
          </Button>
        ) : null}
        <Button type="button" variant="outline" className="flex-1 rounded-xl border-[#9333EA]/40 font-bold text-[#581c87]" onClick={() => openLetterPrintWindow(`מכתב — ${donorName(r)}`, letter)}>
          <Printer className="size-4 shrink-0" aria-hidden />
          הדפסה / PDF
        </Button>
      </div>
      {emailErr ? (
        <p className="mt-2 text-center text-[11px] text-red-700" role="alert">
          {emailErr}
        </p>
      ) : null}
      {emailOk ? (
        <p className="mt-2 text-center text-[11px] font-medium text-emerald-800" role="status">
          אחותי, המייל יצא לדרך — עכשיו רק לחכות ל־inbox
        </p>
      ) : null}

      <div className="mt-4 rounded-xl border border-[#9333EA]/10 bg-white/90 p-2">
        <DonationProgressTrackers r={r} />
      </div>
    </article>
  );
}
