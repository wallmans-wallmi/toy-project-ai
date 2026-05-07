"use client";

import { Button } from "@/components/ui/button";
import { useIsDesktopPicker } from "@/hooks/use-desktop-picker-breakpoint";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { useCallback, useState } from "react";
import { Drawer } from "vaul";

export type AdminSelectOption = { value: string; label: string };

const ADMIN_DRAWER_SNAPS: (number | string)[] = ["42%", 0.94];

function AdminSelectMobileFooter({ onCancel }: { onCancel: () => void }) {
  return (
    <div className="shrink-0 border-t border-[#9333EA]/10 bg-white px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <Button type="button" variant="outline" className="w-full rounded-xl border-slate-200 font-bold text-slate-700" onClick={onCancel}>
        ביטול
      </Button>
    </div>
  );
}

type FieldSelectProps = {
  id?: string;
  value: string;
  /** מותר להחזיר Promise מ־onUpdate (למשל boolean) */
  onChange: (next: string) => void | Promise<unknown>;
  options: readonly AdminSelectOption[];
  ariaLabel: string;
  disabled?: boolean;
  triggerClassName?: string;
  sheetTitle: string;
  sheetSubtitle?: string;
};

/**
 * מובייל: מגירת vaul עם אפשרויות גדולות ו־ביטול. דסקטופ: select מקורי.
 */
export function AdminResponsiveFieldSelect({
  id,
  value,
  onChange,
  options,
  ariaLabel,
  disabled,
  triggerClassName,
  sheetTitle,
  sheetSubtitle,
}: FieldSelectProps) {
  const isDesktop = useIsDesktopPicker();
  const [open, setOpen] = useState(false);
  const currentLabel = options.find((o) => o.value === value)?.label ?? value;

  const apply = useCallback(
    async (next: string) => {
      await onChange(next);
      setOpen(false);
    },
    [onChange],
  );

  if (isDesktop) {
    return (
      <select
        id={id}
        className={cn("rounded-lg border border-slate-200 bg-white text-start", triggerClassName)}
        value={value}
        disabled={disabled}
        aria-label={ariaLabel}
        onChange={(e) => void onChange(e.target.value)}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    );
  }

  return (
    <Drawer.Root
      open={open}
      onOpenChange={setOpen}
      direction="bottom"
      modal
      snapPoints={ADMIN_DRAWER_SNAPS}
      fadeFromIndex={0}
    >
      <Drawer.Trigger asChild disabled={disabled}>
        <button
          type="button"
          id={id}
          className={cn(
            "flex w-full min-h-[44px] items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-start text-[13px] font-semibold text-slate-900 outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-[#9333EA]/50 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400",
            triggerClassName,
          )}
          aria-label={ariaLabel}
          aria-haspopup="dialog"
          aria-expanded={open}
        >
          <span className="min-w-0 truncate">{currentLabel}</span>
          <ChevronDown className="size-4 shrink-0 text-slate-500" aria-hidden />
        </button>
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-[400] bg-black/40" />
        <Drawer.Content
          className="fixed inset-x-0 bottom-0 z-[401] mx-auto flex max-h-[92vh] w-full max-w-[768px] flex-col rounded-t-2xl border border-[#9333EA]/15 bg-[#F9F5FF] outline-none"
          dir="rtl"
        >
          <Drawer.Handle className="mx-auto mt-2 mb-1 h-1 w-10 shrink-0 rounded-full bg-slate-300" />
          <Drawer.Title className="px-4 pt-1 text-start text-base font-bold text-[#111827]">{sheetTitle}</Drawer.Title>
          {sheetSubtitle ? (
            <Drawer.Description className="px-4 pb-2 text-start text-xs leading-relaxed text-slate-600">{sheetSubtitle}</Drawer.Description>
          ) : (
            <Drawer.Description className="sr-only">{sheetTitle}</Drawer.Description>
          )}
          <div className="min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain px-3 py-2">
            {options.map((o) => {
              const active = o.value === value;
              return (
                <button
                  key={o.value}
                  type="button"
                  disabled={disabled}
                  className={cn(
                    "flex w-full min-h-[52px] items-center rounded-xl px-4 text-start text-[15px] font-semibold transition-colors",
                    active ? "bg-[#9333EA]/15 text-[#581c87] ring-2 ring-[#9333EA]" : "bg-white text-slate-800 shadow-sm hover:bg-[#9333EA]/5",
                  )}
                  onClick={() => void apply(o.value)}
                >
                  {o.label}
                </button>
              );
            })}
          </div>
          <AdminSelectMobileFooter onCancel={() => setOpen(false)} />
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

type ActionSelectProps = {
  options: readonly AdminSelectOption[];
  onPick: (value: string) => void | Promise<unknown>;
  ariaLabel: string;
  disabled?: boolean;
  placeholder: string;
  triggerClassName?: string;
  sheetTitle: string;
  sheetSubtitle?: string;
};

/**
 * רשימת פעולות (ללא ערך נשמר בטריגר). מובייל: מגירה, דסקטופ: select עם איפוס אחרי בחירה.
 */
export function AdminResponsiveActionSelect({
  options,
  onPick,
  ariaLabel,
  disabled,
  placeholder,
  triggerClassName,
  sheetTitle,
  sheetSubtitle,
}: ActionSelectProps) {
  const isDesktop = useIsDesktopPicker();
  const [open, setOpen] = useState(false);
  const selectKey = options.map((o) => o.value).join("|");

  const runPick = useCallback(
    async (raw: string) => {
      if (!raw) return;
      await onPick(raw);
      setOpen(false);
    },
    [onPick],
  );

  if (isDesktop) {
    return (
      <select
        key={selectKey}
        className={cn("rounded-lg border border-slate-200 bg-white text-start", triggerClassName)}
        defaultValue=""
        disabled={disabled || options.length === 0}
        aria-label={ariaLabel}
        onChange={(e) => {
          const v = e.target.value;
          void runPick(v);
          e.target.value = "";
        }}
      >
        <option value="" disabled>
          {options.length === 0 ? "אין פעולות זמינות" : placeholder}
        </option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    );
  }

  return (
    <Drawer.Root
      open={open}
      onOpenChange={setOpen}
      direction="bottom"
      modal
      snapPoints={ADMIN_DRAWER_SNAPS}
      fadeFromIndex={0}
    >
      <Drawer.Trigger asChild disabled={disabled || options.length === 0}>
        <button
          type="button"
          className={cn(
            "flex w-full min-h-[44px] items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-start text-[13px] font-semibold text-slate-600 outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-[#9333EA]/50 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400",
            triggerClassName,
          )}
          aria-label={ariaLabel}
          aria-haspopup="dialog"
          aria-expanded={open}
        >
          <span className="min-w-0 truncate">{options.length === 0 ? "אין פעולות זמינות" : placeholder}</span>
          <ChevronDown className="size-4 shrink-0 text-slate-500" aria-hidden />
        </button>
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-[400] bg-black/40" />
        <Drawer.Content
          className="fixed inset-x-0 bottom-0 z-[401] mx-auto flex max-h-[92vh] w-full max-w-[768px] flex-col rounded-t-2xl border border-[#9333EA]/15 bg-[#F9F5FF] outline-none"
          dir="rtl"
        >
          <Drawer.Handle className="mx-auto mt-2 mb-1 h-1 w-10 shrink-0 rounded-full bg-slate-300" />
          <Drawer.Title className="px-4 pt-1 text-start text-base font-bold text-[#111827]">{sheetTitle}</Drawer.Title>
          {sheetSubtitle ? (
            <Drawer.Description className="px-4 pb-2 text-start text-xs leading-relaxed text-slate-600">{sheetSubtitle}</Drawer.Description>
          ) : (
            <Drawer.Description className="sr-only">{sheetTitle}</Drawer.Description>
          )}
          <div className="min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain px-3 py-2">
            {options.map((o) => (
              <button
                key={o.value}
                type="button"
                className="flex w-full min-h-[56px] items-center rounded-xl bg-white px-4 text-start text-[15px] font-semibold text-slate-800 shadow-sm transition-colors hover:bg-[#9333EA]/10"
                onClick={() => void runPick(o.value)}
              >
                {o.label}
              </button>
            ))}
          </div>
          <AdminSelectMobileFooter onCancel={() => setOpen(false)} />
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
