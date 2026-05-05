"use client";

import type { AdminDonationRow } from "@/hooks/useAdminDonations";
import { todayDateIsrael } from "@/lib/admin-today-israel";
import type { DonationMultiFilterState, LogisticsDonationTabId } from "@/lib/admin-logistics-dashboard";
import { useCallback, useMemo, useState } from "react";

/** טווח תאריכים YYYY-MM-DD לפי תאריך יצירת ההזמנה; null = ללא סינון (כל הזמן) */
export type AdminStatsDateRange = { from: string | null; to: string | null };

export type AdminKpis = {
  totalOrders: number;
  pendingPickup: number;
  collected: number;
  arrivedAtNgo: number;
  totalRevenueILS: number;
  lettersSent: number;
};

export type AdminKpiId =
  | "total_orders"
  | "pending_pickup"
  | "collected"
  | "arrived_ngo"
  | "total_revenue"
  | "letters_sent";

export type KpiNavigationTarget = {
  tab: LogisticsDonationTabId;
  filters: DonationMultiFilterState;
};

export function createdDayKey(row: AdminDonationRow): string {
  const raw = (row.created_at ?? "").slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  const t = Date.parse(row.created_at ?? "");
  if (!Number.isFinite(t)) return "";
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jerusalem", year: "numeric", month: "2-digit", day: "2-digit" }).format(t);
}

export function filterRowsByCreatedDateRange(rows: AdminDonationRow[], range: AdminStatsDateRange): AdminDonationRow[] {
  if (!range.from && !range.to) return rows;
  const from = range.from ?? range.to ?? "";
  const to = range.to ?? range.from ?? "";
  if (!from) return rows;
  return rows.filter((r) => {
    const d = createdDayKey(r);
    if (!d) return false;
    return d >= from && d <= to;
  });
}

export function computeAdminKpis(rows: AdminDonationRow[]): AdminKpis {
  let pendingPickup = 0;
  let collected = 0;
  let arrivedAtNgo = 0;
  let totalRevenueILS = 0;
  let lettersSent = 0;

  for (const r of rows) {
    const ps = r.pickup_status ?? "pending";
    if (ps === "pending") pendingPickup += 1;
    if (ps === "picked_up") collected += 1;
    if ((r.delivery_status ?? "") === "delivered") arrivedAtNgo += 1;
    if ((r.payment_status ?? "") === "completed") totalRevenueILS += r.amount_paid ?? 0;
    const ls = r.letter_status ?? "";
    if (ls === "sent" || ls === "completed") lettersSent += 1;
  }

  return {
    totalOrders: rows.length,
    pendingPickup,
    collected,
    arrivedAtNgo,
    totalRevenueILS,
    lettersSent,
  };
}

export function kpiNavigationFor(id: AdminKpiId): KpiNavigationTarget {
  const empty: DonationMultiFilterState = { cities: [], pickupStatuses: [], letterStatuses: [], deliveryStatuses: [] };
  switch (id) {
    case "total_orders":
      return { tab: "all", filters: empty };
    case "pending_pickup":
      return { tab: "all", filters: { ...empty, pickupStatuses: ["pending"] } };
    case "collected":
      return { tab: "all", filters: { ...empty, pickupStatuses: ["picked_up"] } };
    case "arrived_ngo":
      return { tab: "all", filters: { ...empty, deliveryStatuses: ["delivered"] } };
    case "total_revenue":
      return { tab: "all", filters: empty };
    case "letters_sent":
      return { tab: "archive", filters: empty };
    default:
      return { tab: "all", filters: empty };
  }
}

type UseAdminStatsArgs = {
  rows: AdminDonationRow[];
  initialRange?: AdminStatsDateRange;
};

export function useAdminStats({ rows, initialRange }: UseAdminStatsArgs) {
  const [dateRange, setDateRange] = useState<AdminStatsDateRange>(initialRange ?? { from: null, to: null });

  const kpiRows = useMemo(() => filterRowsByCreatedDateRange(rows, dateRange), [rows, dateRange]);
  const kpis = useMemo(() => computeAdminKpis(kpiRows), [kpiRows]);

  const setTodayIsrael = useCallback(() => {
    const t = todayDateIsrael();
    setDateRange({ from: t, to: t });
  }, []);

  const clearDateRange = useCallback(() => setDateRange({ from: null, to: null }), []);

  return { dateRange, setDateRange, kpiRows, kpis, setTodayIsrael, clearDateRange };
}
