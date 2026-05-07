"use client";

import { AdminLogisticsFilterPopoverSheet } from "@/components/admin/admin-logistics-filter-popover-sheet";
import { Button } from "@/components/ui/button";
import type { AdminDonationRow } from "@/hooks/useAdminDonations";
import type { DonationMultiFilterState } from "@/lib/admin-logistics-dashboard";
import { DELIVERY_FILTER_OPTIONS, LETTER_FILTER_OPTIONS, PICKUP_FILTER_OPTIONS, uniqueCitiesFromRows } from "@/lib/admin-logistics-dashboard";
import { useIsDesktopPicker } from "@/hooks/use-desktop-picker-breakpoint";
import { cn } from "@/lib/utils";

function lblPickup(v: string) {
  const m: Record<string, string> = { pending: "ממתין לאיסוף", picked_up: "נאסף", failed: "נכשל" };
  return m[v] ?? v;
}
function lblDeliveryFilter(v: string) {
  const m: Record<string, string> = { at_warehouse: "במחסן", sent_to_ngo: "בדרך לעמותה", delivered: "הגיע לעמותה" };
  return m[v] ?? v;
}

function lblLetter(v: string) {
  const m: Record<string, string> = {
    pending: "ממתין",
    generated: "נוצר",
    sent: "נשלח",
    completed: "הושלם",
    failed: "נכשל",
  };
  return m[v] ?? v;
}

function MultiList({
  options,
  selected,
  toggle,
  labelFn,
  comfortable,
}: {
  options: readonly string[];
  selected: string[];
  toggle: (v: string) => void;
  labelFn: (v: string) => string;
  comfortable?: boolean;
}) {
  return (
    <ul className={cn("max-h-[min(60vh,320px)] space-y-1 overflow-y-auto p-2 text-start", comfortable && "max-h-[55vh]")}>
      {options.map((o) => {
        const on = selected.includes(o);
        return (
          <li key={o}>
            <button
              type="button"
              className={cn(
                "flex w-full items-center gap-3 rounded-xl font-medium transition-colors",
                comfortable ? "min-h-[48px] px-3 py-3 text-[14px]" : "gap-2 rounded-lg px-2 py-1.5 text-[12px]",
                on ? "bg-[#9333EA]/15 text-[#581c87]" : "text-slate-700 hover:bg-slate-50",
              )}
              onClick={() => toggle(o)}
            >
              <span className={cn("shrink-0 rounded border", comfortable ? "size-4" : "size-3.5", on ? "border-[#9333EA] bg-[#9333EA]" : "border-slate-300")} />
              {labelFn(o)}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

type Props = {
  allRows: AdminDonationRow[];
  filters: DonationMultiFilterState;
  onChange: (next: DonationMultiFilterState) => void;
  search: string;
  onSearch: (v: string) => void;
  disabled?: boolean;
};

export function AdminLogisticsFilterBar({ allRows, filters, onChange, search, onSearch, disabled }: Props) {
  const isDesktop = useIsDesktopPicker();
  const touchFriendly = !isDesktop;
  const cities = uniqueCitiesFromRows(allRows);

  function toggleCity(c: string) {
    const set = new Set(filters.cities);
    if (set.has(c)) set.delete(c);
    else set.add(c);
    onChange({ ...filters, cities: [...set] });
  }
  function togglePickup(p: string) {
    const set = new Set(filters.pickupStatuses);
    if (set.has(p)) set.delete(p);
    else set.add(p);
    onChange({ ...filters, pickupStatuses: [...set] });
  }
  function toggleLetter(l: string) {
    const set = new Set(filters.letterStatuses);
    if (set.has(l)) set.delete(l);
    else set.add(l);
    onChange({ ...filters, letterStatuses: [...set] });
  }
  function toggleDelivery(d: string) {
    const set = new Set(filters.deliveryStatuses);
    if (set.has(d)) set.delete(d);
    else set.add(d);
    onChange({ ...filters, deliveryStatuses: [...set] });
  }

  function clearAll() {
    onChange({ cities: [], pickupStatuses: [], letterStatuses: [], deliveryStatuses: [] });
  }

  const chip =
    filters.cities.length + filters.pickupStatuses.length + filters.letterStatuses.length + filters.deliveryStatuses.length > 0
      ? filters.cities.length + filters.pickupStatuses.length + filters.letterStatuses.length + filters.deliveryStatuses.length
      : null;

  return (
    <div className={cn("rounded-2xl border border-[#9333EA]/15 bg-white/90 p-3 shadow-sm", disabled && "pointer-events-none opacity-50")} dir="rtl">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-bold text-[#581c87]">סינון מהיר</span>
        <AdminLogisticsFilterPopoverSheet
          label="עיר"
          count={filters.cities.length || null}
          title="סינון לפי עיר"
          subtitle="אפשר לבחור כמה ערים יחד"
          desktopPopoverClassName="w-56 border-[#9333EA]/20 bg-white"
        >
          <MultiList options={cities} selected={filters.cities} toggle={toggleCity} labelFn={(x) => x} comfortable={touchFriendly} />
        </AdminLogisticsFilterPopoverSheet>
        <AdminLogisticsFilterPopoverSheet
          label="איסוף"
          count={filters.pickupStatuses.length || null}
          title="סטטוס איסוף"
          subtitle="סינון לפי מה שקרה בשטח"
          desktopPopoverClassName="w-52 border-[#9333EA]/20 bg-white"
        >
          <MultiList
            options={PICKUP_FILTER_OPTIONS as unknown as string[]}
            selected={filters.pickupStatuses}
            toggle={togglePickup}
            labelFn={lblPickup}
            comfortable={touchFriendly}
          />
        </AdminLogisticsFilterPopoverSheet>
        <AdminLogisticsFilterPopoverSheet
          label="מכתב"
          count={filters.letterStatuses.length || null}
          title="סטטוס מכתב"
          subtitle="איפה המכתב בתור"
          desktopPopoverClassName="w-52 border-[#9333EA]/20 bg-white"
        >
          <MultiList
            options={LETTER_FILTER_OPTIONS as unknown as string[]}
            selected={filters.letterStatuses}
            toggle={toggleLetter}
            labelFn={lblLetter}
            comfortable={touchFriendly}
          />
        </AdminLogisticsFilterPopoverSheet>
        <AdminLogisticsFilterPopoverSheet
          label="משלוח לעמותה"
          count={filters.deliveryStatuses.length || null}
          title="משלוח לעמותה"
          subtitle="סינון לפי מסלול המשלוח"
          desktopPopoverClassName="w-56 border-[#9333EA]/20 bg-white"
        >
          <MultiList
            options={DELIVERY_FILTER_OPTIONS as unknown as string[]}
            selected={filters.deliveryStatuses}
            toggle={toggleDelivery}
            labelFn={lblDeliveryFilter}
            comfortable={touchFriendly}
          />
        </AdminLogisticsFilterPopoverSheet>
        {chip ? (
          <Button type="button" variant="ghost" size="sm" className="text-[11px] text-slate-600" onClick={clearAll}>
            ניקוי סינונים
          </Button>
        ) : null}
      </div>
      <input
        type="search"
        placeholder="חיפוש — שם, טלפון, מספר הזמנה (למשל 1001 או #1001), מזהה…"
        className="mt-2 w-full rounded-xl border border-slate-200 bg-[#F9F5FF] px-3 py-2 text-[13px] outline-none focus:ring-2 focus:ring-[#9333EA]/40"
        value={search}
        onChange={(e) => onSearch(e.target.value)}
        aria-label="חיפוש"
      />
    </div>
  );
}
