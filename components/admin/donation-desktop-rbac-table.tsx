"use client";

import { DonationDesktopRbacRow } from "@/components/admin/donation-desktop-rbac-row";
import { LetterPreviewModal } from "@/components/admin/letter-preview-modal";
import { Button } from "@/components/ui/button";
import type { AdminDashboardRole } from "@/lib/admin-role-types";
import type { AdminDonationPatch, AdminDonationRow } from "@/hooks/useAdminDonations";
import type { DonationDesktopSortKey, SortDir } from "@/lib/admin-donation-desktop-sort";
import { sortDonationDesktopRows } from "@/lib/admin-donation-desktop-sort";
import { cn } from "@/lib/utils";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";

type Props = {
  rows: AdminDonationRow[];
  role: AdminDashboardRole;
  onUpdate: (id: string, patch: AdminDonationPatch) => Promise<boolean>;
  onQuickView: (row: AdminDonationRow) => void;
  onExport: () => void;
  variant?: "default" | "all";
  showProgress?: boolean;
  lettersQueueMode?: boolean;
};

function SortTh({
  label,
  sortKey,
  activeKey,
  dir,
  onSort,
}: {
  label: string;
  sortKey: DonationDesktopSortKey;
  activeKey: DonationDesktopSortKey | null;
  dir: SortDir;
  onSort: (k: DonationDesktopSortKey) => void;
}) {
  const active = activeKey === sortKey;
  return (
    <th className="px-2 py-2">
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className="inline-flex items-center gap-1 rounded-lg px-1 py-0.5 text-[11px] font-bold text-slate-800 hover:bg-[#9333EA]/10"
      >
        {label}
        {!active ? <ArrowUpDown className="size-3 shrink-0 text-slate-400" aria-hidden /> : dir === "asc" ? <ArrowUp className="size-3 shrink-0 text-[#9333EA]" aria-hidden /> : <ArrowDown className="size-3 shrink-0 text-[#9333EA]" aria-hidden />}
      </button>
    </th>
  );
}

function PlainTh({ children }: { children: ReactNode }) {
  return <th className="px-2 py-2 text-[11px] font-bold text-slate-800">{children}</th>;
}

export function DonationDesktopRbacTable({
  rows,
  role,
  onUpdate,
  onQuickView,
  onExport,
  variant = "default",
  showProgress = true,
  lettersQueueMode = false,
}: Props) {
  const [sortKey, setSortKey] = useState<DonationDesktopSortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [preview, setPreview] = useState<{ open: boolean; title: string; body: string }>({ open: false, title: "", body: "" });

  const sortedRows = useMemo(() => sortDonationDesktopRows(rows, sortKey, sortDir), [rows, sortKey, sortDir]);

  const slimOrdersLayout = variant === "all" && !lettersQueueMode;

  function handleSort(k: DonationDesktopSortKey) {
    if (sortKey === k) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(k);
      setSortDir("desc");
    }
  }

  const colSpan = slimOrdersLayout ? 9 : (variant === "all" ? 13 : 10) + (lettersQueueMode ? 1 : 0);
  const minW = slimOrdersLayout ? "min-w-[1180px]" : variant === "all" ? "min-w-[1240px]" : "min-w-[1020px]";

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button type="button" variant="outline" className="rounded-xl border-[#9333EA]/40 text-[12px] font-semibold text-[#581c87]" onClick={onExport} disabled={rows.length === 0}>
          ייצוא CSV
        </Button>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-[#9333EA]/15 bg-white shadow-sm">
        <table className={cn("w-full text-start", minW)} dir="rtl">
          <thead className="bg-[#F9F5FF] text-slate-700">
            {slimOrdersLayout ? (
              <tr>
                <SortTh label="id" sortKey="donation_id" activeKey={sortKey} dir={sortDir} onSort={handleSort} />
                <SortTh label="מספר הזמנה" sortKey="order_no" activeKey={sortKey} dir={sortDir} onSort={handleSort} />
                <SortTh label="שם מלא" sortKey="full_name" activeKey={sortKey} dir={sortDir} onSort={handleSort} />
                <SortTh label="שם הילד" sortKey="child" activeKey={sortKey} dir={sortDir} onSort={handleSort} />
                <SortTh label="עיר" sortKey="city" activeKey={sortKey} dir={sortDir} onSort={handleSort} />
                <PlainTh>טלפון</PlainTh>
                <SortTh label="סטטוס" sortKey="lifecycle" activeKey={sortKey} dir={sortDir} onSort={handleSort} />
                <PlainTh>התקדמות</PlainTh>
                <th className="w-10 px-2 py-2 text-[11px] font-bold text-slate-800">פרטים</th>
              </tr>
            ) : (
              <tr>
                <SortTh label="ילד/ה" sortKey="child" activeKey={sortKey} dir={sortDir} onSort={handleSort} />
                <SortTh label="פריטים" sortKey="items" activeKey={sortKey} dir={sortDir} onSort={handleSort} />
                <PlainTh>מסלול</PlainTh>
                {variant === "all" ? (
                  <>
                    <SortTh label="עיר" sortKey="city" activeKey={sortKey} dir={sortDir} onSort={handleSort} />
                    <SortTh label="משלוח" sortKey="delivery" activeKey={sortKey} dir={sortDir} onSort={handleSort} />
                    <PlainTh>עמותה</PlainTh>
                  </>
                ) : null}
                <PlainTh>מהיר</PlainTh>
                <SortTh label="איסוף" sortKey="pickup" activeKey={sortKey} dir={sortDir} onSort={handleSort} />
                <SortTh label="לוגיסטיקה" sortKey="pickup_status" activeKey={sortKey} dir={sortDir} onSort={handleSort} />
                <SortTh label="מכתב" sortKey="letter" activeKey={sortKey} dir={sortDir} onSort={handleSort} />
                {lettersQueueMode ? <PlainTh>מכתב מהיר</PlainTh> : null}
                <PlainTh>תורם</PlainTh>
                <SortTh label="תשלום" sortKey="amount" activeKey={sortKey} dir={sortDir} onSort={handleSort} />
                <th className="w-10 px-2 py-2 text-[11px] font-bold text-slate-800">עין</th>
              </tr>
            )}
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sortedRows.map((r) => (
              <DonationDesktopRbacRow
                key={r.id}
                r={r}
                role={role}
                onUpdate={onUpdate}
                onQuickView={onQuickView}
                variant={variant}
                slimOrdersLayout={slimOrdersLayout}
                showProgress={showProgress}
                colSpan={colSpan}
                lettersQueueMode={lettersQueueMode}
                onLetterPreview={(title, body) => setPreview({ open: true, title, body })}
              />
            ))}
          </tbody>
        </table>
      </div>
      <LetterPreviewModal open={preview.open} title={preview.title} body={preview.body} onClose={() => setPreview((p) => ({ ...p, open: false }))} />
    </div>
  );
}
