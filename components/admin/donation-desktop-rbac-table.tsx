"use client";

import { DonationDesktopRbacRow } from "@/components/admin/donation-desktop-rbac-row";
import { Button } from "@/components/ui/button";
import type { AdminDashboardRole } from "@/lib/admin-role-types";
import type { AdminDonationPatch, AdminDonationRow } from "@/hooks/useAdminDonations";
import { cn } from "@/lib/utils";

type Props = {
  rows: AdminDonationRow[];
  role: AdminDashboardRole;
  onUpdate: (id: string, patch: AdminDonationPatch) => Promise<boolean>;
  onQuickView: (row: AdminDonationRow) => void;
  onExport: () => void;
  variant?: "default" | "all";
  showProgress?: boolean;
};

export function DonationDesktopRbacTable({
  rows,
  role,
  onUpdate,
  onQuickView,
  onExport,
  variant = "default",
  showProgress = true,
}: Props) {
  const colSpan = variant === "all" ? 13 : 10;
  const minW = variant === "all" ? "min-w-[1180px]" : "min-w-[960px]";

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button type="button" variant="outline" className="rounded-xl border-[#9333EA]/40 text-[12px] font-semibold text-[#581c87]" onClick={onExport} disabled={rows.length === 0}>
          ייצוא CSV
        </Button>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-[#9333EA]/15 bg-white shadow-sm">
        <table className={cn("w-full text-start", minW)} dir="rtl">
          <thead className="bg-[#F9F5FF] text-[10px] font-bold text-slate-700">
            <tr>
              <th className="px-2 py-2">ילד</th>
              <th className="px-2 py-2">פריטים</th>
              <th className="px-2 py-2">מסלול</th>
              {variant === "all" ? (
                <>
                  <th className="px-2 py-2">עיר</th>
                  <th className="px-2 py-2">משלוח</th>
                  <th className="px-2 py-2">עמותה</th>
                </>
              ) : null}
              <th className="px-2 py-2">מהיר</th>
              <th className="px-2 py-2">איסוף</th>
              <th className="px-2 py-2">לוגיסטיקה</th>
              <th className="px-2 py-2">מכתב</th>
              <th className="px-2 py-2">תורם</th>
              <th className="px-2 py-2">תשלום</th>
              <th className="w-10 px-2 py-2">עין</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((r) => (
              <DonationDesktopRbacRow
                key={r.id}
                r={r}
                role={role}
                onUpdate={onUpdate}
                onQuickView={onQuickView}
                variant={variant}
                showProgress={showProgress}
                colSpan={colSpan}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
