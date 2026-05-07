"use client";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useIsDesktopPicker } from "@/hooks/use-desktop-picker-breakpoint";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { type ReactNode, useState } from "react";
import { Drawer } from "vaul";

const FILTER_SNAPS: (number | string)[] = ["40%", 0.92];

type Props = {
  label: string;
  count: number | null;
  title: string;
  subtitle?: string;
  /** רוחב פופאובר בדסקטופ, למשל w-56 p-0 */
  desktopPopoverClassName: string;
  children: ReactNode;
};

/**
 * סינון אדמין: פופאובר בדסקטופ, מגירת תחתית במובייל עם ביטול.
 */
export function AdminLogisticsFilterPopoverSheet({ label, count, title, subtitle, desktopPopoverClassName, children }: Props) {
  const isDesktop = useIsDesktopPicker();
  const [open, setOpen] = useState(false);

  const trigger = (
    <Button type="button" variant="outline" size="sm" className="rounded-xl border-[#9333EA]/30 text-[11px] font-bold text-[#581c87]">
      {label}
      <ChevronDown className="ms-1 size-3" aria-hidden />
      {count != null && count > 0 ? (
        <span className="me-1 rounded-full bg-[#ec4899] px-1.5 py-0 text-[9px] text-white">{count}</span>
      ) : null}
    </Button>
  );

  if (isDesktop) {
    return (
      <Popover>
        <PopoverTrigger asChild>{trigger}</PopoverTrigger>
        <PopoverContent className={cn("p-0", desktopPopoverClassName)} align="start" dir="rtl">
          {children}
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Drawer.Root open={open} onOpenChange={setOpen} direction="bottom" modal snapPoints={FILTER_SNAPS} fadeFromIndex={0}>
      <Drawer.Trigger asChild>{trigger}</Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-[400] bg-black/40" />
        <Drawer.Content
          className="fixed inset-x-0 bottom-0 z-[401] mx-auto flex max-h-[90vh] w-full max-w-[768px] flex-col rounded-t-2xl border border-[#9333EA]/15 bg-[#F9F5FF] outline-none"
          dir="rtl"
        >
          <Drawer.Handle className="mx-auto mt-2 mb-1 h-1 w-10 shrink-0 rounded-full bg-slate-300" />
          <Drawer.Title className="px-4 pt-1 text-start text-base font-bold text-[#111827]">{title}</Drawer.Title>
          {subtitle ? (
            <Drawer.Description className="px-4 pb-2 text-start text-xs leading-relaxed text-slate-600">{subtitle}</Drawer.Description>
          ) : (
            <Drawer.Description className="sr-only">{title}</Drawer.Description>
          )}
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-1 pb-2">{children}</div>
          <div className="shrink-0 border-t border-[#9333EA]/10 bg-white px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <Button type="button" variant="outline" className="w-full rounded-xl border-slate-200 font-bold text-slate-700" onClick={() => setOpen(false)}>
              ביטול
            </Button>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
