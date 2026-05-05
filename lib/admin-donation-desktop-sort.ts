import type { AdminDonationRow } from "@/hooks/useAdminDonations";
import { formatToyItemsLine } from "@/hooks/useAdminDonations";
import { extractCityKey } from "@/lib/admin-logistics-dashboard";

export type DonationDesktopSortKey =
  | "child"
  | "items"
  | "pickup"
  | "city"
  | "amount"
  | "letter"
  | "pickup_status"
  | "delivery";

export type SortDir = "asc" | "desc";

function pickupSortKey(r: AdminDonationRow): string {
  const d = r.pickup_date ?? "";
  const t = (r.pickup_time ?? "").slice(0, 5);
  return `${d} ${t}`;
}

function cmp(a: string | number, b: string | number, dir: SortDir): number {
  const m = dir === "asc" ? 1 : -1;
  if (typeof a === "number" && typeof b === "number") return (a - b) * m;
  return String(a).localeCompare(String(b), "he", { numeric: true }) * m;
}

export function sortDonationDesktopRows(rows: AdminDonationRow[], key: DonationDesktopSortKey | null, dir: SortDir): AdminDonationRow[] {
  if (!key) return rows;
  const copy = [...rows];
  copy.sort((ra, rb) => {
    switch (key) {
      case "child":
        return cmp(ra.child_name ?? "", rb.child_name ?? "", dir);
      case "items":
        return cmp(formatToyItemsLine(ra), formatToyItemsLine(rb), dir);
      case "pickup":
        return cmp(pickupSortKey(ra), pickupSortKey(rb), dir);
      case "city":
        return cmp(extractCityKey(ra), extractCityKey(rb), dir);
      case "amount":
        return cmp(ra.amount_paid ?? 0, rb.amount_paid ?? 0, dir);
      case "letter":
        return cmp(ra.letter_status ?? "", rb.letter_status ?? "", dir);
      case "pickup_status":
        return cmp(ra.pickup_status ?? "", rb.pickup_status ?? "", dir);
      case "delivery":
        return cmp(ra.delivery_status ?? "", rb.delivery_status ?? "", dir);
      default:
        return 0;
    }
  });
  return copy;
}
