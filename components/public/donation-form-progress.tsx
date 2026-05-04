import { Fragment } from "react";
import { cn } from "@/lib/utils";

/** כוכבית ליד תווית שדה חובה */
export function RequiredFieldStar({ className }: { className?: string }) {
  return (
    <abbr title="שדה חובה" className={cn("ms-0.5 font-bold text-[#9333EA] no-underline", className)}>
      *
    </abbr>
  );
}

/** נקודות צעדים כמו ב־nifradim-be-hiuch-v2-form (טופס איסוף) */
export function ClaudePickupStepIndicator({
  stepIndex,
  stepCount,
  maxStepReached,
  onStepClick,
}: {
  stepIndex: number;
  stepCount: number;
  maxStepReached: number;
  onStepClick?: (index: number) => void;
}) {
  return (
    <div className="steps-indicator" aria-label="התקדמות בטופס">
      {Array.from({ length: stepCount }, (_, i) => {
        const clickable = Boolean(onStepClick) && i <= maxStepReached;
        const dotClass = cn(
          "step-dot",
          i < stepIndex && "done",
          i === stepIndex && "active",
          i > stepIndex && "upcoming",
          clickable && "step-dot--clickable",
        );
        const inner = i < stepIndex ? "✓" : i + 1;

        return (
          <Fragment key={i}>
            {clickable ? (
              <button
                type="button"
                className={dotClass}
                aria-current={i === stepIndex ? "step" : undefined}
                aria-label={`מעבר לשלב ${i + 1}`}
                onClick={() => onStepClick?.(i)}
              >
                {inner}
              </button>
            ) : (
              <div className={dotClass} aria-current={i === stepIndex ? "step" : undefined}>
                {inner}
              </div>
            )}
            {i < stepCount - 1 ? (
              <div className={cn("step-line", i < stepIndex && "done")} aria-hidden />
            ) : null}
          </Fragment>
        );
      })}
    </div>
  );
}

type StepProgressProps = {
  stepIndex: number;
  stepCount: number;
  large?: boolean;
  /** צבע מותג לפס התקדמות */
  accent?: "default" | "pickup";
  maxStepReached?: number;
  onStepClick?: (index: number) => void;
};

const ACCENT = {
  default: {
    active: "bg-[#a855f7]",
    track: "bg-[#a855f7]",
  },
  pickup: {
    active: "bg-[#9333EA]",
    track: "bg-[#9333EA]",
  },
} as const;

export function DonationFormProgress({
  stepIndex,
  stepCount,
  large,
  accent = "default",
  maxStepReached = 0,
  onStepClick,
}: StepProgressProps) {
  const colors = ACCENT[accent];
  const interactive = Boolean(onStepClick);

  return (
    <div className="w-full overflow-x-auto pb-1" aria-label="התקדמות בטופס">
      <div className={cn("flex items-center", large ? "min-w-[340px]" : "min-w-[280px]")}>
        {Array.from({ length: stepCount }, (_, i) => {
          const active = i <= stepIndex;
          const done = i < stepIndex;
          const clickable = interactive && i <= maxStepReached;

          const circleClass = cn(
            "flex shrink-0 items-center justify-center rounded-full font-bold transition-colors",
            large ? "size-9 text-sm sm:size-10 sm:text-base" : "size-8 text-xs sm:size-10 sm:text-sm",
            active ? cn("text-white", colors.active) : "bg-slate-100 text-slate-400",
            clickable && "cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9333EA]",
          );

          return (
            <div key={i} className="flex flex-1 items-center last:flex-none">
              {clickable ? (
                <button
                  type="button"
                  className={circleClass}
                  aria-current={i === stepIndex ? "step" : undefined}
                  aria-label={`מעבר לשלב ${i + 1}`}
                  onClick={() => onStepClick?.(i)}
                >
                  {done ? "✓" : i + 1}
                </button>
              ) : (
                <div className={circleClass} aria-current={i === stepIndex ? "step" : undefined}>
                  {done ? "✓" : i + 1}
                </div>
              )}
              {i < stepCount - 1 ? (
                <div
                  className={cn(
                    "mx-0.5 h-0.5 min-w-[8px] flex-1 rounded-full sm:mx-2",
                    i < stepIndex ? colors.track : "bg-slate-200",
                  )}
                  aria-hidden
                />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
