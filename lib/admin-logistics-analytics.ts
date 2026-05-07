import type { AdminDonationRow } from "@/hooks/useAdminDonations";
import { isDonationPaymentCompletedValue } from "@/lib/donation-payment-status";

export type LogisticsAnalytics = {
  totalRows: number;
  pickedUpCount: number;
  deliveredToNgoCount: number;
  paidTotal: number;
  ngoDistribution: { name: string; count: number }[];
  avgDaysPickupToDelivered: number | null;
};

function parseDateMs(s: string | null | undefined): number | null {
  if (!s) return null;
  const t = Date.parse(s);
  return Number.isFinite(t) ? t : null;
}

export function computeLogisticsAnalytics(rows: AdminDonationRow[]): LogisticsAnalytics {
  let pickedUpCount = 0;
  let deliveredToNgoCount = 0;
  let paidTotal = 0;
  const ngoMap = new Map<string, number>();
  const deltas: number[] = [];

  for (const r of rows) {
    if ((r.pickup_status ?? "") === "picked_up") pickedUpCount += 1;
    if ((r.delivery_status ?? "") === "delivered") deliveredToNgoCount += 1;
    if (isDonationPaymentCompletedValue(r.payment_status as string | null | undefined | boolean))
      paidTotal += r.amount_paid ?? 0;

    const ngo = (r.ngo_name ?? r.target_ngo_name ?? "").trim() || "ללא שם עמותה";
    ngoMap.set(ngo, (ngoMap.get(ngo) ?? 0) + 1);

    if ((r.delivery_status ?? "") === "delivered") {
      const c0 = parseDateMs(r.created_at);
      const c1 = parseDateMs(r.delivery_time);
      if (c0 !== null && c1 !== null && c1 >= c0) deltas.push((c1 - c0) / (86400000));
    }
  }

  const ngoDistribution = [...ngoMap.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  let avgDaysPickupToDelivered: number | null = null;
  if (deltas.length > 0) avgDaysPickupToDelivered = Math.round((deltas.reduce((a, b) => a + b, 0) / deltas.length) * 10) / 10;

  return {
    totalRows: rows.length,
    pickedUpCount,
    deliveredToNgoCount,
    paidTotal,
    ngoDistribution,
    avgDaysPickupToDelivered,
  };
}
