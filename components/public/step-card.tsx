import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const accentStyles = {
  purple: "bg-[#a855f7] text-white",
  mint: "bg-emerald-400 text-white",
  orange: "bg-orange-400 text-white",
} as const;

export type StepCardAccent = keyof typeof accentStyles;

type StepCardProps = {
  stepNumber: number;
  accent: StepCardAccent;
  icon: ReactNode;
  title: string;
  description: string;
  className?: string;
};

export function StepCard({
  stepNumber,
  accent,
  icon,
  title,
  description,
  className,
}: StepCardProps) {
  return (
    <article
      className={cn(
        "relative flex flex-col gap-4 rounded-3xl border border-white/60 bg-white/90 p-6 backdrop-blur-sm sm:p-8",
        className,
      )}
    >
      <div
        className={cn(
          "flex size-10 items-center justify-center rounded-full text-sm font-bold",
          accentStyles[accent],
        )}
        aria-hidden
      >
        {stepNumber}
      </div>
      <div className="text-4xl leading-none" aria-hidden>
        {icon}
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        <p className="text-sm leading-relaxed text-slate-600">{description}</p>
      </div>
    </article>
  );
}
