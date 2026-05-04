"use client";

import { ChevronDown } from "lucide-react";
import { SelectionDrawer } from "@/components/forms/SelectionDrawer";
import { TimeSlotDrawer } from "@/components/forms/TimeSlotDrawer";
import { RequiredFieldStar } from "@/components/public/donation-form-progress";
import type { DonationFormState } from "@/hooks/use-donation-form";
import { useIsDesktopPicker } from "@/hooks/use-desktop-picker-breakpoint";
import type { ShippingDetailsUpdater } from "@/hooks/useShippingDetails";
import { useShippingDetails } from "@/hooks/useShippingDetails";
import { formatPickupTimeSummaryLine } from "@/lib/pickup-schedule-slots";
import type { PickupTimeSlot } from "@/lib/pickup-regions";
import { useCallback, useMemo, useRef, useState, type KeyboardEvent } from "react";

const triggerBase =
  "flex min-h-[48px] w-full cursor-pointer items-center justify-between gap-2 rounded-xl border border-[#9333EA]/20 bg-white px-4 py-3 text-start text-base outline-none transition-colors hover:border-[#9333EA]/35 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#9333EA] focus-visible:outline-offset-1 disabled:cursor-not-allowed disabled:opacity-50";

const desktopCityInputClass =
  "min-h-[48px] w-full rounded-xl border border-[#9333EA]/20 bg-white px-4 py-3 pe-11 text-start text-base text-[#111827] outline-none transition-[border-color,box-shadow] placeholder:text-slate-400 focus:border-[#9333EA] focus:outline-none focus:ring-2 focus:ring-[#9333EA]/25";

type ShippingPickersProps = {
  form: DonationFormState;
  updateField: ShippingDetailsUpdater;
  slots: PickupTimeSlot[];
  /** כמו בשדות pickup — לעיתים ללא מחלקה */
  labelClassName?: string;
};

export function ShippingPickers({ form, updateField, slots, labelClassName }: ShippingPickersProps) {
  const [cityOpen, setCityOpen] = useState(false);
  const [timeOpen, setTimeOpen] = useState(false);
  const isDesktop = useIsDesktopPicker();
  const cityListRef = useRef<HTMLUListElement>(null);
  const cityInputRef = useRef<HTMLInputElement>(null);
  const { cityQuery, setCityQuery, filteredCities, applyCitySelection } = useShippingDetails();

  const lbl = labelClassName ?? "text-xs font-semibold text-slate-700";
  const timeSummary = useMemo(() => {
    const slotLabel = slots.find((s) => s.id === form.pickupSlotId)?.label ?? "";
    return formatPickupTimeSummaryLine(
      form.pickupDate,
      form.pickupSlotId,
      slotLabel,
    );
  }, [form.pickupDate, form.pickupSlotId, slots]);

  const handleCityOpenChange = useCallback(
    (open: boolean) => {
      setCityOpen(open);
      if (!open) setCityQuery("");
    },
    [setCityQuery],
  );

  const onCityListKeyDown = useCallback((e: KeyboardEvent<HTMLUListElement>) => {
    const opts = [
      ...(cityListRef.current?.querySelectorAll<HTMLElement>("[data-city-option]") ?? []),
    ];
    if (!opts.length) return;
    const active = document.activeElement as HTMLElement | undefined;
    let idx = active ? opts.indexOf(active) : -1;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = idx < 0 ? 0 : Math.min(idx + 1, opts.length - 1);
      opts[next]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (idx <= 0) {
        cityInputRef.current?.focus();
        return;
      }
      opts[idx - 1]?.focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      opts[0]?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      opts[opts.length - 1]?.focus();
    }
  }, []);

  const onCityInputKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        const first = cityListRef.current?.querySelector<HTMLElement>("[data-city-option]");
        first?.focus();
      }
    },
    [],
  );

  const cityOptionClass =
    "w-full rounded-lg border border-transparent bg-white px-3 py-2.5 text-start text-sm font-medium text-[#111827] transition-colors hover:border-[#9333EA]/25 hover:bg-[#F9F5FF] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#9333EA] focus-visible:outline-offset-1";

  const cityList = (
    <ul
      ref={cityListRef}
      id="pickup-city-listbox"
      role="listbox"
      aria-label="ערים לאיסוף"
      className="flex flex-col gap-1 p-0"
      onKeyDown={onCityListKeyDown}
    >
      {filteredCities.length === 0 ? (
        <li className="list-none px-3 py-4 text-center text-sm leading-relaxed text-slate-500" role="presentation">
          לא מצאנו עיר עם השם הזה — נסו חיפוש אחר
        </li>
      ) : (
        filteredCities.map((city) => (
          <li key={city.name} className="list-none">
            <button
              type="button"
              role="option"
              aria-selected={form.pickupCity === city.name}
              data-city-option=""
              className={cityOptionClass}
              onClick={() => {
                applyCitySelection(city, updateField);
                handleCityOpenChange(false);
              }}
            >
              {city.name}
            </button>
          </li>
        ))
      )}
    </ul>
  );

  return (
    <>
      <div className="field-group space-y-2">
        <label
          htmlFor={isDesktop ? "pickup-city-combobox-input" : "pickup-city-drawer-trigger"}
          className={lbl}
        >
          עיר לאיסוף
          <RequiredFieldStar />
        </label>
        {isDesktop ? (
          <SelectionDrawer
            desktopCityCombobox
            open={cityOpen}
            onOpenChange={handleCityOpenChange}
            title="בחירת עיר"
            subtitle="חיפוש לפי שם בעברית"
            trigger={
              <div className="relative w-full">
                <input
                  ref={cityInputRef}
                  id="pickup-city-combobox-input"
                  type="search"
                  role="combobox"
                  aria-expanded={cityOpen}
                  aria-controls="pickup-city-listbox"
                  aria-autocomplete="list"
                  value={cityOpen ? cityQuery : form.pickupCity}
                  onChange={(e) => {
                    setCityQuery(e.target.value);
                    setCityOpen(true);
                  }}
                  onFocus={() => {
                    setCityOpen(true);
                    setCityQuery("");
                  }}
                  onKeyDown={onCityInputKeyDown}
                  placeholder={cityOpen ? "הקלידו כדי לסנן..." : "למשל תל אביב..."}
                  className={desktopCityInputClass}
                  dir="rtl"
                  autoComplete="off"
                />
                <ChevronDown
                  className="pointer-events-none absolute end-3 top-1/2 size-5 -translate-y-1/2 text-slate-400"
                  aria-hidden
                />
              </div>
            }
          >
            {cityList}
          </SelectionDrawer>
        ) : (
          <SelectionDrawer
            open={cityOpen}
            onOpenChange={handleCityOpenChange}
            title="בחירת עיר"
            subtitle="חיפוש לפי שם בעברית"
            headerSlot={
              <div className="px-4 pb-2">
                <input
                  type="search"
                  value={cityQuery}
                  onChange={(e) => setCityQuery(e.target.value)}
                  placeholder="למשל תל אביב..."
                  className="w-full rounded-xl border border-[#9333EA]/20 bg-white px-3 py-2.5 text-sm text-[#111827] outline-none placeholder:text-slate-400 focus-visible:border-[#9333EA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9333EA]/25"
                  dir="rtl"
                  autoComplete="off"
                />
              </div>
            }
            trigger={
              <button id="pickup-city-drawer-trigger" type="button" className={triggerBase}>
                <span className={form.pickupCity ? "text-[#111827]" : "text-slate-400"}>
                  {form.pickupCity || "בחרו עיר מהרשימה"}
                </span>
                <ChevronDown className="size-5 shrink-0 text-slate-400" aria-hidden />
              </button>
            }
          >
            {cityList}
          </SelectionDrawer>
        )}
      </div>

      <div className="field-group space-y-2">
        <label htmlFor="pickup-slot-drawer-trigger" className={lbl}>
          זמן לאיסוף
          <RequiredFieldStar />
        </label>
        <TimeSlotDrawer
          open={timeOpen}
          onOpenChange={setTimeOpen}
          regionId={form.region}
          form={form}
          updateField={updateField}
          trigger={
            <button id="pickup-slot-drawer-trigger" type="button" className={triggerBase} disabled={!form.region}>
              <span className={timeSummary ? "text-[#111827]" : "text-slate-400"}>
                {!form.region ? "קודם יש לבחור עיר" : timeSummary || "בחרו יום ושעת איסוף"}
              </span>
              <ChevronDown className="size-5 shrink-0 text-slate-400" aria-hidden />
            </button>
          }
        />
        <p className="field-note">לפי העיר נקבע אזור האיסוף והחלונות הזמינים</p>
      </div>
    </>
  );
}
