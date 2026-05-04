"use client";

import { Drawer } from "vaul";
import type { ReactNode } from "react";
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useIsDesktopPicker } from "@/hooks/use-desktop-picker-breakpoint";
import { cn } from "@/lib/utils";

type SelectionDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  subtitle?: string;
  trigger: ReactNode;
  headerSlot?: ReactNode;
  children: ReactNode;
  /**
   * דסקטופ (>768px): פופאובר combobox — `trigger` מעוגן כשדה הקלט, בלי חיפוש כפול בתוך הרשימה.
   * מובייל: נשארת מגירת vaul עם כפתור + חיפוש במגירה.
   */
  desktopCityCombobox?: boolean;
};

function DesktopChrome({
  title,
  subtitle,
  headerSlot,
  children,
}: {
  title: string;
  subtitle?: string;
  headerSlot?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex max-h-[min(72vh,520px)] w-[var(--radix-popover-trigger-width)] min-w-[280px] max-w-[440px] flex-col overflow-hidden bg-white",
      )}
      dir="rtl"
    >
      <div className="shrink-0 border-b border-[#9333EA]/20 bg-white px-3 pt-3 pb-2">
        <h2 className="text-start text-base font-bold leading-snug text-[#111827]">{title}</h2>
        {subtitle ? (
          <p className="mt-0.5 text-start text-xs leading-relaxed text-slate-600">{subtitle}</p>
        ) : null}
      </div>
      {headerSlot ? (
        <div className="sticky top-0 z-10 shrink-0 border-b border-[#9333EA]/20 bg-white px-3 py-2">
          {headerSlot}
        </div>
      ) : null}
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-2">{children}</div>
    </div>
  );
}

function DesktopCityComboboxChrome({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div
      className="flex max-h-[min(50vh,380px)] w-[var(--radix-popover-trigger-width)] min-w-0 flex-col overflow-hidden bg-white"
      dir="rtl"
    >
      <div className="sr-only">
        {title}
        {subtitle ? ` — ${subtitle}` : ""}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2">{children}</div>
    </div>
  );
}

/**
 * מובייל: מגירת vaul (עד max-w 768px). שולחן עבודה: פופאובר Radix — מצב רגיל או combobox לעיר.
 */
export function SelectionDrawer({
  open,
  onOpenChange,
  title,
  subtitle,
  trigger,
  headerSlot,
  children,
  desktopCityCombobox = false,
}: SelectionDrawerProps) {
  const isDesktop = useIsDesktopPicker();

  if (isDesktop && desktopCityCombobox) {
    return (
      <Popover open={open} onOpenChange={onOpenChange}>
        <PopoverAnchor asChild>{trigger}</PopoverAnchor>
        <PopoverContent
          side="bottom"
          align="start"
          sideOffset={8}
          avoidCollisions
          className="border-[#9333EA]/20 bg-white p-0"
          dir="rtl"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <DesktopCityComboboxChrome title={title} subtitle={subtitle}>
            {children}
          </DesktopCityComboboxChrome>
        </PopoverContent>
      </Popover>
    );
  }

  if (isDesktop) {
    return (
      <Popover open={open} onOpenChange={onOpenChange}>
        <PopoverTrigger asChild>{trigger}</PopoverTrigger>
        <PopoverContent
          side="bottom"
          align="start"
          sideOffset={8}
          avoidCollisions
          className="border-[#9333EA]/20 bg-white p-0"
          dir="rtl"
        >
          <DesktopChrome title={title} subtitle={subtitle} headerSlot={headerSlot}>
            {children}
          </DesktopChrome>
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
          className="fixed inset-x-0 bottom-0 z-[401] mx-auto flex max-h-[88vh] w-full max-w-[768px] flex-col rounded-t-xl bg-[#F9F5FF] outline-none"
          dir="rtl"
        >
          <Drawer.Handle className="mx-auto mt-2 mb-1 h-1 w-10 shrink-0 rounded-full bg-slate-300" />
          <Drawer.Title className="px-4 pt-1 text-start text-base font-bold leading-snug text-[#111827]">
            {title}
          </Drawer.Title>
          {subtitle ? (
            <Drawer.Description className="px-4 pb-2 text-start text-xs leading-relaxed text-slate-600">
              {subtitle}
            </Drawer.Description>
          ) : (
            <Drawer.Description className="sr-only">{title}</Drawer.Description>
          )}
          {headerSlot}
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-8">{children}</div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
