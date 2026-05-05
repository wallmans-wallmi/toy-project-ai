"use client";

import { Button } from "@/components/ui/button";
import type { AdminDonationRow } from "@/hooks/useAdminDonations";
import { getDonationLetterBody } from "@/lib/admin-letters-queue";
import type { AdminDashboardRole } from "@/lib/admin-role-types";
import { buildLetterWhatsAppUrl } from "@/lib/letter-whatsapp-url";
import { openLetterPrintWindow } from "@/lib/open-letter-print";
import { Mail, MessageCircle, Printer, ScrollText } from "lucide-react";
import { useState } from "react";

function donorName(r: AdminDonationRow): string {
  return [r.first_name, r.last_name].filter(Boolean).join(" ").trim() || "—";
}

type Props = {
  r: AdminDonationRow;
  role: AdminDashboardRole;
  onPreview: (title: string, body: string) => void;
};

export function LetterRowQuickActions({ r, role, onPreview }: Props) {
  const canOffice = role === "admin" || role === "office";
  const letter = getDonationLetterBody(r);
  const wa = buildLetterWhatsAppUrl(r.phone, letter);
  const [emailBusy, setEmailBusy] = useState(false);

  async function sendEmail() {
    setEmailBusy(true);
    try {
      const res = await fetch("/api/admin/letters/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ donationId: r.id }),
      });
      await res.json();
    } finally {
      setEmailBusy(false);
    }
  }

  if (!canOffice) {
    return <span className="text-[11px] text-slate-400">—</span>;
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-1">
      <Button type="button" size="sm" variant="outline" className="h-8 w-8 shrink-0 rounded-lg border-[#9333EA]/35 p-0" title="צפייה במכתב" onClick={() => onPreview(`מכתב — ${donorName(r)}`, letter)}>
        <ScrollText className="size-3.5" aria-hidden />
      </Button>
      {wa ? (
        <a
          href={wa}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#ec4899] text-white shadow-sm hover:bg-[#db2777]"
          title="WhatsApp"
        >
          <MessageCircle className="size-3.5" aria-hidden />
        </a>
      ) : null}
      <Button type="button" size="sm" variant="outline" className="h-8 w-8 shrink-0 rounded-lg border-[#9333EA]/35 p-0" title="שליחת מייל" disabled={emailBusy} onClick={() => void sendEmail()}>
        <Mail className="size-3.5" aria-hidden />
      </Button>
      <Button type="button" size="sm" variant="outline" className="h-8 w-8 shrink-0 rounded-lg border-[#9333EA]/35 p-0" title="הדפסה / PDF" onClick={() => openLetterPrintWindow(`מכתב — ${donorName(r)}`, letter)}>
        <Printer className="size-3.5" aria-hidden />
      </Button>
    </div>
  );
}
