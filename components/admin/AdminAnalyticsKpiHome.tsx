"use client";

import { Button } from "@/components/ui/button";
import type { AdminKpiId, AdminKpis, AdminStatsDateRange } from "@/hooks/useAdminStats";
import { cn } from "@/lib/utils";

type Props = {
  kpis: AdminKpis;
  dateRange: AdminStatsDateRange;
  onDateRangeChange: (next: AdminStatsDateRange) => void;
  onToday: () => void;
  onClearRange: () => void;
  onKpiClick: (id: AdminKpiId) => void;
};

const KPI_DEF: { id: AdminKpiId; title: string; subtitle: string; value: (k: AdminKpis) => string | number }[] = [
  { id: "total_orders", title: "סה״כ הזמנות", subtitle: "לא כולל טיוטות פוטנציאל — לפי תאריך יצירה בטווח", value: (k) => k.totalOrders },
  { id: "waiting_for_kit", title: "מחכים לערכה", subtitle: "לפני או בזמן משלוח הערכה מהמחסן", value: (k) => k.waitingForKit },
  {
    id: "kit_at_customer_no_pickup",
    title: "קיבלו ערכה",
    subtitle: "עוד לא קבעו איסוף מהבית",
    value: (k) => k.kitAtCustomerAwaitingSchedule,
  },
  { id: "waiting_for_pickup", title: "מחכים לאיסוף", subtitle: "תואם חלון או שליח בדרך, עדיין לא נאסף", value: (k) => k.waitingForPickup },
  { id: "arrived_at_ngo", title: "הגיעו לעמותה", subtitle: "סטטוס משלוח: הגיע לעמותה", value: (k) => k.arrivedAtNgo },
  { id: "waiting_for_letter", title: "מחכים למכתב", subtitle: "אצל העמותה, המכתב עדיין בתור", value: (k) => k.waitingForLetter },
  { id: "letters_sent", title: "מכתבים שנשלחו", subtitle: "סטטוס מכתב: נשלח או הושלם", value: (k) => k.lettersSent },
  { id: "total_revenue", title: "סכום ששולם", subtitle: "תשלומים שהושלמו (₪)", value: (k) => k.totalRevenueILS.toLocaleString("he-IL") },
];

const ACCENT_KPIS = new Set<AdminKpiId>(["letters_sent", "waiting_for_letter", "total_revenue"]);

export function AdminAnalyticsKpiHome({ kpis, dateRange, onDateRangeChange, onToday, onClearRange, onKpiClick }: Props) {
  const rangeActive = Boolean(dateRange.from || dateRange.to);

  return (
    <div className="space-y-4 rounded-2xl border border-[#9333EA]/20 bg-white p-4 shadow-sm" dir="rtl" lang="he">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <div>
          <h2 className="text-[16px] font-bold text-[#581c87]">סקירה — מספרים שמחייכים בחזרה</h2>
          <p className="mt-0.5 text-[12px] text-slate-600">בוחרים טווח תאריכים לפי יום יצירת ההזמנה, או «היום» לסטטיסטיקה יומית</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex flex-col gap-0.5 text-[11px] font-bold text-[#581c87]">
            מתאריך
            <input
              type="date"
              className="rounded-xl border border-[#9333EA]/25 bg-[#F9F5FF] px-2 py-1.5 text-[13px] outline-none focus:ring-2 focus:ring-[#9333EA]/35"
              value={dateRange.from ?? ""}
              onChange={(e) => onDateRangeChange({ ...dateRange, from: e.target.value || null })}
            />
          </label>
          <label className="flex flex-col gap-0.5 text-[11px] font-bold text-[#581c87]">
            עד תאריך
            <input
              type="date"
              className="rounded-xl border border-[#9333EA]/25 bg-[#F9F5FF] px-2 py-1.5 text-[13px] outline-none focus:ring-2 focus:ring-[#9333EA]/35"
              value={dateRange.to ?? ""}
              onChange={(e) => onDateRangeChange({ ...dateRange, to: e.target.value || null })}
            />
          </label>
          <Button type="button" className="rounded-xl bg-[#9333EA] text-[12px] font-bold text-white shadow hover:bg-[#7c3aed]" onClick={onToday}>
            היום
          </Button>
          {rangeActive ? (
            <Button type="button" variant="outline" className="rounded-xl border-[#9333EA]/35 text-[12px] font-semibold text-[#581c87]" onClick={onClearRange}>
              כל הזמן
            </Button>
          ) : null}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {KPI_DEF.map((def) => (
          <button
            key={def.id}
            type="button"
            onClick={() => onKpiClick(def.id)}
            className={cn(
              "rounded-2xl border p-4 text-start shadow-sm transition-all hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9333EA]",
              ACCENT_KPIS.has(def.id)
                ? "border-[#ec4899]/30 bg-gradient-to-br from-pink-50/80 to-[#F9F5FF]"
                : "border-[#9333EA]/15 bg-[#F9F5FF]",
            )}
          >
            <p className="text-[16px] font-bold text-[#581c87]">{def.title}</p>
            <p className="mt-0.5 text-[12px] text-slate-600">{def.subtitle}</p>
            <p className="mt-3 text-3xl font-black tabular-nums text-[#9333EA]">{def.value(kpis)}</p>
            <p className="mt-2 text-[11px] font-medium text-[#9333EA]">לחיצה — מעבר לטאב המתאים עם סינון</p>
          </button>
        ))}
      </div>
    </div>
  );
}
