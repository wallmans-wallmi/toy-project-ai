import type { AdminDonationRow } from "@/hooks/useAdminDonations";
import { todayDateIsrael } from "@/lib/admin-today-israel";

export type DashboardTabId = "todays_route" | "logistics" | "letters" | "archive";

export function isTodaysRouteRow(r: AdminDonationRow): boolean {
  const today = todayDateIsrael();
  const d = r.pickup_date ?? "";
  const st = r.pickup_status ?? "pending";
  return d === today && st !== "picked_up";
}

export function isLogisticsActiveRow(r: AdminDonationRow): boolean {
  const ds = r.delivery_status ?? "at_warehouse";
  const ps = r.pickup_status ?? "pending";
  if (ds === "sent_to_ngo") return true;
  if (ps === "picked_up" && ds !== "delivered") return true;
  return false;
}

export function isLetterQueueRow(r: AdminDonationRow): boolean {
  const ds = r.delivery_status ?? "";
  const ls = r.letter_status ?? "pending";
  return ds === "delivered" && ls === "pending";
}

export function filterDonationsByTab(rows: AdminDonationRow[], tab: DashboardTabId): AdminDonationRow[] {
  if (tab === "todays_route") return rows.filter(isTodaysRouteRow);
  if (tab === "logistics") return rows.filter(isLogisticsActiveRow);
  if (tab === "letters") return rows.filter(isLetterQueueRow);
  return rows.filter((r) => !isTodaysRouteRow(r) && !isLogisticsActiveRow(r) && !isLetterQueueRow(r));
}

export function filterDonationsBySearch(rows: AdminDonationRow[], q: string): AdminDonationRow[] {
  const s = q.trim().toLowerCase();
  if (!s) return rows;
  return rows.filter((r) => {
    const hay = [r.child_name, r.first_name, r.last_name, r.phone, r.email, r.pickup_city, r.address]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return hay.includes(s);
  });
}
