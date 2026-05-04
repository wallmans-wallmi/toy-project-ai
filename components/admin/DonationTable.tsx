"use client";

import { DonationAdminUnifiedTable } from "@/components/admin/donation-admin-unified-table";
import type { AdminDonationPatch, AdminDonationRow } from "@/hooks/useAdminDonations";

type DonationTableProps = {
  rows: AdminDonationRow[];
  onUpdate: (id: string, patch: AdminDonationPatch) => Promise<boolean>;
  onQuickView: (row: AdminDonationRow) => void;
  onExport: () => void;
};

/**
 * טבלת אדמין מאוחדת: תרומות + לוגיסטיקה (איסוף, סטטוסים, משלוח, מכתב) — דסקטופ ומובייל.
 */
export function DonationTable(props: DonationTableProps) {
  return (
    <div dir="rtl" lang="he">
      <DonationAdminUnifiedTable {...props} />
    </div>
  );
}
