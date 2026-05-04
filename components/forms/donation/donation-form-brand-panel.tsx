"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type DonationFormBrandPanelProps = {
  children: ReactNode;
  className?: string;
  /** אנימציית כניסה (מובייל־פירסט) */
  animate?: boolean;
};

/** מיכל טופס תרומה — רקע מותג ו־padding אחיד */
export function DonationFormBrandPanel({
  children,
  className,
  animate = false,
}: DonationFormBrandPanelProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-[#9333EA]/15 bg-[#F9F5FF] px-4 py-5 sm:px-5",
        animate && "animate-donation-journey-panel motion-reduce:animate-none",
        className,
      )}
      dir="rtl"
      lang="he"
    >
      {children}
    </div>
  );
}
