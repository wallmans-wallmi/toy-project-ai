"use client";

import { Drawer } from "vaul";
import { useCallback, useEffect, useMemo, useState, type KeyboardEvent } from "react";
import type { ReactNode } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { DonationFormState } from "@/hooks/use-donation-form";
import { useIsDesktopPicker } from "@/hooks/use-desktop-picker-breakpoint";
import { applyPickupDateTime, type ShippingDetailsUpdater } from "@/hooks/useShippingDetails";
import { getPickupMonThuForWeekOffset } from "@/lib/pickup-schedule-slots";
import { cn } from "@/lib/utils";

const weekTabBase =
  "min-h-[44px] flex-1 rounded-xl border px-3 py-2.5 text-sm font-semibold transition-colors outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#9333EA] focus-visible:outline-offset-1";
const weekTabOn = "border-[#9333EA] bg-[#9333EA] text-white";
const weekTabOff =
  "border-[#E5E7EB] bg-white text-[#111827] hover:border-[#9333EA]/35 hover:bg-[#F9F5FF]";

const slotCardBase =
  "flex min-h-[52px] flex-1 min-w-0 flex-col items-center justify-center rounded-2xl border px-3 py-3 text-center text-sm font-semibold leading-snug transition-colors outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#9333EA] focus-visible:outline-offset-1 sm:min-h-[56px] sm:px-4 sm:text-[0.95rem]";
const slotCardIdle = "border-[#E5E7EB] bg-white text-[#111827] hover:border-[#9333EA]/35 hover:bg-slate-50/80";
const slotCardSelected = "border-[#9333EA] bg-[#F9F5FF] text-[#581c87] ring-2 ring-[#9333EA]/25";

type TimeSlotDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: ReactNode;
  regionId: string;
  form: DonationFormState;
  updateField: ShippingDetailsUpdater;
};

function inferWeekOffsetFromForm(
  pickupDate: string,
  pickupSlotId: string | null,
): 0 | 1 {
  const d = pickupDate.trim();
  if (!d || !pickupSlotId) return 0;
  const p0 = getPickupMonThuForWeekOffset(0);
  const p1 = getPickupMonThuForWeekOffset(1);
  const tail = pickupSlotId.split("_").pop();
  if (tail === "mon_1214") {
    if (d === p1.mon.iso) return 1;
    return 0;
  }
  if (tail === "thu_1214") {
    if (d === p1.thu.iso) return 1;
    return 0;
  }
  return 0;
}

export function TimeSlotDrawer({
  open,
  onOpenChange,
  trigger,
  regionId,
  form,
  updateField,
}: TimeSlotDrawerProps) {
  const isDesktop = useIsDesktopPicker();
  const [weekOffset, setWeekOffset] = useState<0 | 1>(0);

  const pair = useMemo(() => getPickupMonThuForWeekOffset(weekOffset), [weekOffset]);

  useEffect(() => {
    if (!open) return;
    setWeekOffset(inferWeekOffsetFromForm(form.pickupDate, form.pickupSlotId));
  }, [open, form.pickupDate, form.pickupSlotId]);

  const isSelected = useCallback(
    (iso: string, slotTail: "mon_1214" | "thu_1214") => {
      if (!regionId || !form.pickupSlotId) return false;
      return form.pickupDate.trim() === iso && form.pickupSlotId === `${regionId}_${slotTail}`;
    },
    [form.pickupDate, form.pickupSlotId, regionId],
  );

  const pick = (iso: string, slotTail: "mon_1214" | "thu_1214") => {
    if (!regionId) return;
    applyPickupDateTime(iso, `${regionId}_${slotTail}`, updateField);
    onOpenChange(false);
  };

  const onPickerPanelKeyDown = useCallback((e: KeyboardEvent<HTMLDivElement>) => {
    const buttons = [...e.currentTarget.querySelectorAll<HTMLElement>("button[data-slot-choice]")];
    if (!buttons.length) return;
    const active = document.activeElement as HTMLElement | undefined;
    let idx = active ? buttons.indexOf(active) : -1;

    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      const delta = e.key === "ArrowRight" ? 1 : -1;
      const next = idx < 0 ? 0 : Math.max(0, Math.min(idx + delta, buttons.length - 1));
      buttons[next]?.focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      buttons[0]?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      buttons[buttons.length - 1]?.focus();
    }
  }, []);

  const bodySection = (
    <div
      role="group"
      aria-label="זמן לאיסוף"
      onKeyDown={onPickerPanelKeyDown}
      className="space-y-4"
    >
      <div className="flex gap-2" role="tablist" aria-label="בחירת שבוע">
        <button
          type="button"
          role="tab"
          aria-selected={weekOffset === 0}
          className={cn(weekTabBase, weekOffset === 0 ? weekTabOn : weekTabOff)}
          onClick={() => setWeekOffset(0)}
        >
          השבוע הקרוב
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={weekOffset === 1}
          className={cn(weekTabBase, weekOffset === 1 ? weekTabOn : weekTabOff)}
          onClick={() => setWeekOffset(1)}
        >
          שבוע אחרי
        </button>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <button
          type="button"
          data-slot-choice=""
          disabled={!regionId}
          onClick={() => pick(pair.mon.iso, "mon_1214")}
          className={cn(
            slotCardBase,
            isSelected(pair.mon.iso, "mon_1214") ? slotCardSelected : slotCardIdle,
            !regionId && "pointer-events-none opacity-45",
          )}
        >
          {pair.mon.line}
        </button>
        <button
          type="button"
          data-slot-choice=""
          disabled={!regionId}
          onClick={() => pick(pair.thu.iso, "thu_1214")}
          className={cn(
            slotCardBase,
            isSelected(pair.thu.iso, "thu_1214") ? slotCardSelected : slotCardIdle,
            !regionId && "pointer-events-none opacity-45",
          )}
        >
          {pair.thu.line}
        </button>
      </div>
    </div>
  );

  const headerTitle = "זמן לאיסוף";
  const headerDesc = "בוחרים יום ושעת איסוף מהחלונות הזמינים";

  if (isDesktop) {
    return (
      <Popover open={open} onOpenChange={onOpenChange}>
        <PopoverTrigger asChild>{trigger}</PopoverTrigger>
        <PopoverContent
          side="bottom"
          align="start"
          sideOffset={8}
          className="border-[#9333EA]/20 bg-white p-0"
          dir="rtl"
        >
          <div className="flex max-h-[min(72vh,560px)] w-[var(--radix-popover-trigger-width)] min-w-[min(100vw-2rem,440px)] max-w-[440px] flex-col overflow-hidden bg-white">
            <div className="shrink-0 border-b border-[#9333EA]/20 px-3 pt-3 pb-2">
              <h2 className="text-start text-base font-bold leading-snug text-[#111827]">{headerTitle}</h2>
              <p className="mt-1 text-start text-xs leading-relaxed text-slate-600">{headerDesc}</p>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-3">{bodySection}</div>
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange} direction="bottom" modal>
      <Drawer.Trigger asChild>{trigger}</Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-[400] bg-black/40" aria-hidden />
        <Drawer.Content
          className="fixed inset-x-0 bottom-0 z-[401] mx-auto flex max-h-[88vh] w-full max-w-[768px] flex-col rounded-t-xl bg-white outline-none"
          dir="rtl"
        >
          <Drawer.Handle className="mx-auto mt-2 mb-1 h-1 w-10 shrink-0 rounded-full bg-slate-300" />
          <Drawer.Title className="px-4 pt-1 text-start text-base font-bold leading-snug text-[#111827]">
            {headerTitle}
          </Drawer.Title>
          <Drawer.Description className="px-4 pt-1 text-start text-xs leading-relaxed text-slate-600">
            {headerDesc}
          </Drawer.Description>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
            {bodySection}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
