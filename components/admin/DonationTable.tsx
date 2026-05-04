"use client";

import { DonationLogisticsPanel } from "@/components/admin/donation-logistics-panel";
import { DonationOverviewTable } from "@/components/admin/donation-overview-table";
import type { AdminDonationPatch, AdminDonationRow } from "@/hooks/useAdminDonations";
import { cn } from "@/lib/utils";
import { useState } from "react";

type DonationTableProps = {
  rows: AdminDonationRow[];
  onUpdate: (id: string, patch: AdminDonationPatch) => Promise<boolean>;
  onQuickView: (row: AdminDonationRow) => void;
  onExport: () => void;
};

type TabId = "overview" | "logistics";

export function DonationTable({ rows, onUpdate, onQuickView, onExport }: DonationTableProps) {
  const [tab, setTab] = useState<TabId>("overview");

  return (
    <div className="space-y-4" dir="rtl" lang="he">
      <div
        role="tablist"
        aria-label="תצוגות לוח ניהול"
        className="flex flex-wrap gap-2 border-b border-[#9333EA]/15 pb-2"
      >
        <button
          type="button"
          role="tab"
          aria-selected={tab === "overview"}
          className={cn(
            "rounded-xl px-4 py-2 text-[13px] font-bold transition-colors",
            tab === "overview"
              ? "bg-[#9333EA] text-white shadow-sm"
              : "bg-white text-[#581c87] ring-1 ring-[#9333EA]/25 hover:bg-[#F9F5FF]",
          )}
          onClick={() => setTab("overview")}
        >
          תרומות וסטטוסים
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "logistics"}
          className={cn(
            "rounded-xl px-4 py-2 text-[13px] font-bold transition-colors",
            tab === "logistics"
              ? "bg-[#9333EA] text-white shadow-sm"
              : "bg-white text-[#581c87] ring-1 ring-[#9333EA]/25 hover:bg-[#F9F5FF]",
          )}
          onClick={() => setTab("logistics")}
        >
          לוגיסטיקה ועמותות
        </button>
      </div>

      {tab === "overview" ? (
        <DonationOverviewTable rows={rows} onUpdate={onUpdate} onQuickView={onQuickView} onExport={onExport} />
      ) : (
        <DonationLogisticsPanel rows={rows} onUpdate={onUpdate} onQuickView={onQuickView} />
      )}
    </div>
  );
}
