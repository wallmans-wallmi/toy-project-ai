"use client";

import { DonationDesktopRbacTable } from "@/components/admin/donation-desktop-rbac-table";
import { DonationMobileCard } from "@/components/admin/donation-mobile-card";
import type { AdminDashboardRole } from "@/lib/admin-role-types";
import type { AdminDonationPatch, AdminDonationRow } from "@/hooks/useAdminDonations";

type DonationTableProps = {
  role: AdminDashboardRole;
  rows: AdminDonationRow[];
  onUpdate: (id: string, patch: AdminDonationPatch) => Promise<boolean>;
  onQuickView: (row: AdminDonationRow) => void;
  onExport: () => void;
};

export function DonationTable({ role, rows, onUpdate, onQuickView, onExport }: DonationTableProps) {
  return (
    <div dir="rtl" lang="he" className="space-y-4">
      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#9333EA]/25 bg-white px-6 py-10 text-center text-[13px] text-slate-600">
          אין רשומות בטאב הזה כרגע — זה לא באג, פשוט שקט יחסי
        </div>
      ) : null}

      <div className="hidden lg:block">
        {rows.length > 0 ? (
          <DonationDesktopRbacTable role={role} rows={rows} onUpdate={onUpdate} onQuickView={onQuickView} onExport={onExport} />
        ) : null}
      </div>

      <div className="flex flex-col gap-4 lg:hidden">
        {rows.map((r) => (
          <DonationMobileCard key={r.id} r={r} role={role} onUpdate={onUpdate} onQuickView={onQuickView} />
        ))}
      </div>
    </div>
  );
}
