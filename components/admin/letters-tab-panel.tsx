"use client";

import { LetterPreviewModal } from "@/components/admin/letter-preview-modal";
import { LettersTabCard } from "@/components/admin/letters-tab-card";
import type { AdminDonationPatch, AdminDonationRow } from "@/hooks/useAdminDonations";
import type { AdminDashboardRole } from "@/lib/admin-role-types";
import { sortLettersQueueRows } from "@/lib/admin-letters-queue";
import { useMemo, useState } from "react";

type Props = {
  rows: AdminDonationRow[];
  role: AdminDashboardRole;
  onUpdate: (id: string, patch: AdminDonationPatch) => Promise<boolean>;
};

export function LettersTabPanel({ rows, role, onUpdate }: Props) {
  const sorted = useMemo(() => sortLettersQueueRows(rows), [rows]);
  const [preview, setPreview] = useState<{ open: boolean; title: string; body: string }>({
    open: false,
    title: "",
    body: "",
  });

  return (
    <div className="space-y-4" dir="rtl" lang="he">
      <p className="text-center text-[12px] text-slate-600">תור ממוין לפי זמן הגעה למחסן — מכתבים אחרי תשלום ואיסוף בעמותה</p>
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
        {sorted.map((r) => (
          <LettersTabCard key={r.id} r={r} role={role} onUpdate={onUpdate} onPreview={(title, body) => setPreview({ open: true, title, body })} />
        ))}
      </div>
      <LetterPreviewModal open={preview.open} title={preview.title} body={preview.body} onClose={() => setPreview((p) => ({ ...p, open: false }))} />
    </div>
  );
}
