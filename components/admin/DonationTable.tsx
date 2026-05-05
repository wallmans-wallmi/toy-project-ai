"use client";

import { DonationDesktopRbacTable } from "@/components/admin/donation-desktop-rbac-table";
import { DonationMobileCard } from "@/components/admin/donation-mobile-card";
import { LettersTabPanel } from "@/components/admin/letters-tab-panel";
import { TodaysRoutePickupCard } from "@/components/admin/todays-route-pickup-card";
import type { AdminDonationPatch, AdminDonationRow } from "@/hooks/useAdminDonations";
import type { AdminDashboardRole } from "@/lib/admin-role-types";
import { sortLettersQueueRows } from "@/lib/admin-letters-queue";
import { sortDonationsByPickupTime } from "@/lib/admin-todays-route-sort";
import { useMemo } from "react";

type DonationTableProps = {
  role: AdminDashboardRole;
  rows: AdminDonationRow[];
  onUpdate: (id: string, patch: AdminDonationPatch) => Promise<boolean>;
  onQuickView: (row: AdminDonationRow) => void;
  onExport: () => void;
  variant?: "default" | "all";
  showProgress?: boolean;
  layout?: "default" | "todaysRoute" | "letters";
};

export function DonationTable({
  role,
  rows,
  onUpdate,
  onQuickView,
  onExport,
  variant = "default",
  showProgress = true,
  layout = "default",
}: DonationTableProps) {
  const displayRows = useMemo(() => {
    if (layout === "todaysRoute") return sortDonationsByPickupTime(rows);
    if (layout === "letters") return sortLettersQueueRows(rows);
    return rows;
  }, [rows, layout]);

  const hasRows = displayRows.length > 0;

  return (
    <div dir="rtl" lang="he" className="space-y-4">
      {!hasRows ? (
        <div className="rounded-2xl border border-dashed border-[#9333EA]/25 bg-[#F9F5FF] px-6 py-10 text-center text-[13px] text-slate-600">
          אין רשומות בטאב הזה כרגע — זה לא באג, פשוט שקט יחסי
        </div>
      ) : null}

      {hasRows && layout === "todaysRoute" ? (
        <p className="text-center text-[12px] font-medium text-slate-600 lg:hidden">הרשימה ממוינת לפי שעת האיסוף — מהמוקדם למאוחר</p>
      ) : null}

      {hasRows && layout === "todaysRoute" ? (
        <div className="hidden lg:block">
          <DonationDesktopRbacTable
            role={role}
            rows={displayRows}
            onUpdate={onUpdate}
            onQuickView={onQuickView}
            onExport={onExport}
            variant={variant}
            showProgress={showProgress}
            lettersQueueMode={false}
          />
        </div>
      ) : null}

      {hasRows && layout === "todaysRoute" ? (
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 lg:hidden">
          {displayRows.map((r) => (
            <TodaysRoutePickupCard key={r.id} r={r} role={role} onUpdate={onUpdate} showProgress={showProgress} />
          ))}
        </div>
      ) : null}

      {hasRows && layout === "letters" ? (
        <div className="hidden lg:block">
          <DonationDesktopRbacTable
            role={role}
            rows={displayRows}
            onUpdate={onUpdate}
            onQuickView={onQuickView}
            onExport={onExport}
            variant={variant}
            showProgress={showProgress}
            lettersQueueMode
          />
        </div>
      ) : null}

      {hasRows && layout === "letters" ? (
        <div className="lg:hidden">
          <LettersTabPanel rows={displayRows} role={role} onUpdate={onUpdate} />
        </div>
      ) : null}

      {hasRows && layout === "default" ? (
        <>
          <div className="hidden lg:block">
            <DonationDesktopRbacTable
              role={role}
              rows={displayRows}
              onUpdate={onUpdate}
              onQuickView={onQuickView}
              onExport={onExport}
              variant={variant}
              showProgress={showProgress}
              lettersQueueMode={false}
            />
          </div>

          <div className="flex flex-col gap-4 lg:hidden">
            {displayRows.map((r) => (
              <DonationMobileCard key={r.id} r={r} role={role} onUpdate={onUpdate} onQuickView={onQuickView} showProgress={showProgress} />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
