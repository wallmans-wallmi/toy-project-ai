"use client";

import type { AdminDonationRow } from "@/hooks/useAdminDonations";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const LOG_LABELS = ["שולם", "ממתין לאיסוף", "נאסף", "הגיע לעמותה"] as const;
const LET_LABELS = ["פריטים נאספו", "מכתב נשלח", "מכתב הגיע ליעד"] as const;

function logisticsActiveIndex(r: AdminDonationRow): number {
  const paid = (r.payment_status ?? "") === "completed";
  const ps = r.pickup_status ?? "pending";
  if ((r.delivery_status ?? "") === "delivered") return 3;
  if (ps === "picked_up") return 2;
  if (paid && (ps === "pending" || ps === "failed")) return 1;
  if (paid) return 0;
  return -1;
}

function letterActiveIndex(r: AdminDonationRow): number {
  let s = -1;
  if ((r.pickup_status ?? "") === "picked_up") s = 0;
  const ls = r.letter_status ?? "pending";
  if (s >= 0 && (ls === "generated" || ls === "sent" || ls === "completed")) s = Math.max(s, 1);
  if (ls === "completed") s = 2;
  return s;
}

function Track({
  title,
  labels,
  active,
}: {
  title: string;
  labels: readonly string[];
  active: number;
}) {
  const n = labels.length;
  const fillPct = active < 0 ? 0 : Math.min(100, ((active + 1) / n) * 100);

  return (
    <div className="rounded-xl border border-[#9333EA]/12 bg-[#faf5ff] px-2 py-2">
      <p className="text-[10px] font-bold text-[#581c87]">{title}</p>
      <div className="relative mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
        <motion.div
          className="absolute inset-y-0 start-0 rounded-full bg-gradient-to-l from-[#9333EA] to-[#ec4899]"
          initial={false}
          animate={{ width: `${fillPct}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 18 }}
        />
      </div>
      <div className="mt-2 flex justify-between gap-1">
        {labels.map((lb, i) => {
          const done = i <= active;
          const current = i === active;
          return (
            <span
              key={lb}
              className={cn(
                "flex-1 text-center text-[9px] font-semibold leading-tight",
                done ? "text-[#581c87]" : "text-slate-400",
                current && "text-[#ec4899]",
              )}
            >
              {lb}
            </span>
          );
        })}
      </div>
    </div>
  );
}

export function DonationProgressTrackers({ r }: { r: AdminDonationRow }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2" dir="rtl">
      <Track title="לוגיסטיקה" labels={LOG_LABELS} active={logisticsActiveIndex(r)} />
      <Track title="מכתב" labels={LET_LABELS} active={letterActiveIndex(r)} />
    </div>
  );
}
