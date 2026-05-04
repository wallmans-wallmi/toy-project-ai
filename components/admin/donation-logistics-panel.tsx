"use client";

import { LogisticsDonationCardMobile } from "@/components/admin/logistics-donation-card-mobile";
import { LogisticsDonationRowDesktop } from "@/components/admin/logistics-donation-row-desktop";
import type { AdminDonationPatch, AdminDonationRow } from "@/hooks/useAdminDonations";

type DonationLogisticsPanelProps = {
  rows: AdminDonationRow[];
  onUpdate: (id: string, patch: AdminDonationPatch) => Promise<boolean>;
  onQuickView: (row: AdminDonationRow) => void;
};

export function DonationLogisticsPanel({ rows, onUpdate, onQuickView }: DonationLogisticsPanelProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-[16px] font-bold text-slate-900">לוגיסטיקה ועמותות</h2>
        <p className="text-[12px] text-slate-600">
          כאן מסדרים איסוף, מעקב אחרי המחסן והדרך לעמותה — הכול בשפה שלנו, בלי פורמליות מיותרת
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#9333EA]/25 bg-white px-6 py-10 text-center text-[13px] text-slate-600">
          אין עדיין שורות — ברגע שיבואו בקשות, תוכלו לתזמן אותן מפה
        </div>
      ) : null}

      <div className="hidden overflow-x-auto rounded-2xl border border-[#9333EA]/15 bg-white shadow-sm lg:block">
        <table className="w-full min-w-[720px] text-start text-[12px]">
          <thead className="bg-[#F9F5FF] text-[11px] font-bold text-slate-700">
            <tr>
              <th className="px-2 py-2">בקשה</th>
              <th className="px-2 py-2">איסוף</th>
              <th className="px-2 py-2">יעד (NGO)</th>
              <th className="w-20 px-2 py-2">פעולות</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((r) => (
              <LogisticsDonationRowDesktop key={r.id} r={r} onUpdate={onUpdate} onQuickView={onQuickView} />
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 lg:hidden">
        {rows.map((r) => (
          <LogisticsDonationCardMobile key={r.id} r={r} onUpdate={onUpdate} onQuickView={onQuickView} />
        ))}
      </div>
    </div>
  );
}
