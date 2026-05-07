"use client";

import {
  PORTAL_FULFILLMENT_STAGES,
  PORTAL_STAGE_LABELS,
  deriveEffectiveFulfillmentStage,
  donationStageSourceFromPortalOrder,
  stageIndex,
} from "@/lib/portal/fulfillment-stages";
import type { PortalDonationOrder } from "@/lib/portal/types";
import { cn } from "@/lib/utils";

type PortalOrderProgressBarProps = {
  order: PortalDonationOrder;
};

/** בר התקדמות אנכי בסגנון ה־HTML (נפרדים בחיוך) */
export function PortalOrderProgressBar({ order }: PortalOrderProgressBarProps) {
  const src = donationStageSourceFromPortalOrder(order);
  const current = deriveEffectiveFulfillmentStage(src);
  const currentIdx = stageIndex(current);

  return (
    <div
      className="order-progress-bar mt-4 flex flex-col gap-0"
      aria-label="התקדמות הטיפול בבקשה"
      dir="rtl"
      lang="he"
    >
      {PORTAL_FULFILLMENT_STAGES.map((stage, idx) => {
        const label = PORTAL_STAGE_LABELS[stage];
        const done = idx < currentIdx;
        const active = idx === currentIdx;
        const isLast = idx === PORTAL_FULFILLMENT_STAGES.length - 1;

        return (
          <div key={stage} className="flex gap-3.5">
            <div className="flex w-[22px] shrink-0 flex-col items-center self-stretch">
              <div
                className={cn(
                  "flex size-[22px] shrink-0 items-center justify-center rounded-full text-[0.65rem] font-bold transition-colors",
                  done && "bg-[#9333EA] text-white",
                  active &&
                    "border-[2.5px] border-[#9333EA] bg-white text-[#9333EA] shadow-[0_0_0_4px_rgba(147,51,234,0.12)]",
                  !done && !active && "border-2 border-neutral-200 bg-neutral-100 text-neutral-400",
                )}
                aria-hidden
              >
                {done ? "✓" : idx + 1}
              </div>
              {!isLast ? (
                <div
                  className={cn(
                    "mt-0.5 w-0.5 min-h-4 flex-1 rounded-sm",
                    idx < currentIdx ? "bg-[#9333EA]" : "bg-neutral-200",
                  )}
                  aria-hidden
                />
              ) : null}
            </div>
            <p
              className={cn(
                "pb-5 text-[0.83rem] font-semibold leading-snug text-neutral-500",
                done && "text-neutral-800",
                active && "font-bold text-[#9333EA]",
              )}
            >
              {label}
            </p>
          </div>
        );
      })}
    </div>
  );
}
