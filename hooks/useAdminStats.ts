"use client";

import type { AdminDonationRow } from "@/hooks/useAdminDonations";
import { todayDateIsrael } from "@/lib/admin-today-israel";
import {
  donationRowForPipelineTab,
  excludeFunnelPotentialRows,
  isLettersTabRow,
  type DonationMultiFilterState,
  type LogisticsDonationTabId,
} from "@/lib/admin-logistics-dashboard";
import { orderPipelineTab, type AdminOrderPipelineTab } from "@/lib/donation-funnel-stage";
import { useCallback, useMemo, useState } from "react";

/** טווח תאריכים YYYY-MM-DD לפי תאריך יצירת ההזמנה; null = ללא סינון (כל הזמן) */
export type AdminStatsDateRange = { from: string | null; to: string | null };

export type AdminKpis = {
  totalOrders: number;
  waitingForKit: number;
  kitAtCustomerAwaitingSchedule: number;
  waitingForPickup: number;
  arrivedAtNgo: number;
  waitingForLetter: number;
  lettersSent: number;
  totalRevenueILS: number;
};

export type AdminKpiId =
  | "total_orders"
  | "waiting_for_kit"
  | "kit_at_customer_no_pickup"
  | "waiting_for_pickup"
  | "arrived_at_ngo"
  | "waiting_for_letter"
  | "letters_sent"
  | "total_revenue";

export type KpiNavigationTarget = {
  tab: LogisticsDonationTabId;
  filters: DonationMultiFilterState;
  orderPipeline?: AdminOrderPipelineTab;
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
  const paidRows = excludeFunnelPotentialRows(rows);
  let waitingForKit = 0;
  let kitAtCustomerAwaitingSchedule = 0;
  let waitingForPickup = 0;
  let arrivedAtNgo = 0;
  let waitingForLetter = 0;
  let lettersSent = 0;
  let totalRevenueILS = 0;

  for (const r of paidRows) {
    const pipe = orderPipelineTab(donationRowForPipelineTab(r));
    if (pipe === "kit") waitingForKit += 1;
    if (pipe === "kit_ready") kitAtCustomerAwaitingSchedule += 1;
    if (pipe === "pickup") waitingForPickup += 1;
    if ((r.delivery_status ?? "").trim() === "delivered") arrivedAtNgo += 1;
    if (isLettersTabRow(r)) waitingForLetter += 1;
    totalRevenueILS += r.amount_paid ?? 0;
    const ls = r.letter_status ?? "";
    if (ls === "sent" || ls === "completed") lettersSent += 1;
  }

  return {
    totalOrders: paidRows.length,
    waitingForKit,
    kitAtCustomerAwaitingSchedule,
    waitingForPickup,
    arrivedAtNgo,
    waitingForLetter,
    lettersSent,
    totalRevenueILS,
  };
}

export function kpiNavigationFor(id: AdminKpiId): KpiNavigationTarget {
  const empty: DonationMultiFilterState = { cities: [], pickupStatuses: [], letterStatuses: [], deliveryStatuses: [] };
  switch (id) {
    case "total_orders":
      return { tab: "orders", filters: empty, orderPipeline: "all" };
    case "waiting_for_kit":
      return { tab: "orders", filters: empty, orderPipeline: "kit" };
    case "kit_at_customer_no_pickup":
      return { tab: "orders", filters: empty, orderPipeline: "kit_ready" };
    case "waiting_for_pickup":
      return { tab: "orders", filters: empty, orderPipeline: "pickup" };
    case "arrived_at_ngo":
      return { tab: "orders", filters: { ...empty, deliveryStatuses: ["delivered"] }, orderPipeline: "all" };
    case "waiting_for_letter":
      return { tab: "letters", filters: empty };
    case "letters_sent":
      return { tab: "archive", filters: empty };
    case "total_revenue":
      return { tab: "customers", filters: empty, orderPipeline: "all" };
    default:
      return { tab: "orders", filters: empty, orderPipeline: "all" };
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
