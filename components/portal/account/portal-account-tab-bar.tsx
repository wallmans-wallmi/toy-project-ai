"use client";

import { cn } from "@/lib/utils";

export type PortalAccountTabId = "profile" | "orders" | "settings";

const TABS: { id: PortalAccountTabId; label: string }[] = [
  { id: "profile", label: "הפרופיל שלי" },
  { id: "orders", label: "ההזמנות שלי" },
  { id: "settings", label: "ההגדרות שלי" },
];

type PortalAccountTabBarProps = {
  active: PortalAccountTabId;
  onChange: (tab: PortalAccountTabId) => void;
};

export function PortalAccountTabBar({ active, onChange }: PortalAccountTabBarProps) {
  return (
    <div
      className="-mx-1 flex gap-0 overflow-x-auto border-b border-violet-200/80 bg-stone-50/90 px-1 [scrollbar-width:none] sm:mx-0 sm:rounded-none sm:border-0 sm:border-b sm:border-violet-100 sm:bg-white [&::-webkit-scrollbar]:hidden"
      role="tablist"
      aria-label="אזור חשבון"
      dir="rtl"
      lang="he"
    >
      {TABS.map((t) => (
        <button
          key={t.id}
          type="button"
          role="tab"
          aria-selected={active === t.id}
          className={cn(
            "shrink-0 border-b-2 border-transparent px-3.5 py-3 text-center text-[0.82rem] font-semibold transition-colors sm:px-4",
            active === t.id
              ? "border-[#9333EA] text-[#9333EA]"
              : "text-neutral-500 hover:text-[#9333EA]",
          )}
          onClick={() => onChange(t.id)}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
