"use client";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { AdminDonationRow } from "@/hooks/useAdminDonations";
import type { DonationMultiFilterState } from "@/lib/admin-logistics-dashboard";
import { DELIVERY_FILTER_OPTIONS, LETTER_FILTER_OPTIONS, PICKUP_FILTER_OPTIONS, uniqueCitiesFromRows } from "@/lib/admin-logistics-dashboard";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

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
}: {
  options: readonly string[];
  selected: string[];
  toggle: (v: string) => void;
  labelFn: (v: string) => string;
}) {
  return (
    <ul className="max-h-48 space-y-1 overflow-y-auto p-2 text-start">
      {options.map((o) => {
        const on = selected.includes(o);
        return (
          <li key={o}>
            <button
              type="button"
              className={cn(
                "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-[12px] font-medium transition-colors",
                on ? "bg-[#9333EA]/15 text-[#581c87]" : "text-slate-700 hover:bg-slate-50",
              )}
              onClick={() => toggle(o)}
            >
              <span className={cn("size-3.5 rounded border", on ? "border-[#9333EA] bg-[#9333EA]" : "border-slate-300")} />
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
        <Popover>
          <PopoverTrigger asChild>
            <Button type="button" variant="outline" size="sm" className="rounded-xl border-[#9333EA]/30 text-[11px] font-bold text-[#581c87]">
              עיר
              <ChevronDown className="ms-1 size-3" aria-hidden />
              {filters.cities.length ? <span className="me-1 rounded-full bg-[#ec4899] px-1.5 py-0 text-[9px] text-white">{filters.cities.length}</span> : null}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-0" align="start">
            <MultiList options={cities} selected={filters.cities} toggle={toggleCity} labelFn={(x) => x} />
          </PopoverContent>
        </Popover>
        <Popover>
          <PopoverTrigger asChild>
            <Button type="button" variant="outline" size="sm" className="rounded-xl border-[#9333EA]/30 text-[11px] font-bold text-[#581c87]">
              איסוף
              <ChevronDown className="ms-1 size-3" aria-hidden />
              {filters.pickupStatuses.length ? (
                <span className="me-1 rounded-full bg-[#ec4899] px-1.5 py-0 text-[9px] text-white">{filters.pickupStatuses.length}</span>
              ) : null}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-52 p-0" align="start">
            <MultiList options={PICKUP_FILTER_OPTIONS as unknown as string[]} selected={filters.pickupStatuses} toggle={togglePickup} labelFn={lblPickup} />
          </PopoverContent>
        </Popover>
        <Popover>
          <PopoverTrigger asChild>
            <Button type="button" variant="outline" size="sm" className="rounded-xl border-[#9333EA]/30 text-[11px] font-bold text-[#581c87]">
              מכתב
              <ChevronDown className="ms-1 size-3" aria-hidden />
              {filters.letterStatuses.length ? (
                <span className="me-1 rounded-full bg-[#ec4899] px-1.5 py-0 text-[9px] text-white">{filters.letterStatuses.length}</span>
              ) : null}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-52 p-0" align="start">
            <MultiList options={LETTER_FILTER_OPTIONS as unknown as string[]} selected={filters.letterStatuses} toggle={toggleLetter} labelFn={lblLetter} />
          </PopoverContent>
        </Popover>
        <Popover>
          <PopoverTrigger asChild>
            <Button type="button" variant="outline" size="sm" className="rounded-xl border-[#9333EA]/30 text-[11px] font-bold text-[#581c87]">
              משלוח לעמותה
              <ChevronDown className="ms-1 size-3" aria-hidden />
              {filters.deliveryStatuses.length ? (
                <span className="me-1 rounded-full bg-[#ec4899] px-1.5 py-0 text-[9px] text-white">{filters.deliveryStatuses.length}</span>
              ) : null}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-0" align="start">
            <MultiList options={DELIVERY_FILTER_OPTIONS as unknown as string[]} selected={filters.deliveryStatuses} toggle={toggleDelivery} labelFn={lblDeliveryFilter} />
          </PopoverContent>
        </Popover>
        {chip ? (
          <Button type="button" variant="ghost" size="sm" className="text-[11px] text-slate-600" onClick={clearAll}>
            ניקוי סינונים
          </Button>
        ) : null}
      </div>
      <input
        type="search"
        placeholder="חיפוש חופשי — שם, טלפון, עמותה…"
        className="mt-2 w-full rounded-xl border border-slate-200 bg-[#F9F5FF] px-3 py-2 text-[13px] outline-none focus:ring-2 focus:ring-[#9333EA]/40"
        value={search}
        onChange={(e) => onSearch(e.target.value)}
        aria-label="חיפוש"
      />
    </div>
  );
}
