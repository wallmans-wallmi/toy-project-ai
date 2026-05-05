"use client";

import type { LogisticsAnalytics } from "@/lib/admin-logistics-analytics";

type Props = { analytics: LogisticsAnalytics };

export function AdminLogisticsAnalytics({ analytics }: Props) {
  const { totalRows, pickedUpCount, deliveredToNgoCount, paidTotal, ngoDistribution, avgDaysPickupToDelivered } = analytics;

  return (
    <div className="space-y-4 rounded-2xl border border-[#9333EA]/20 bg-white p-4 shadow-sm" dir="rtl" lang="he">
      <div>
        <h2 className="text-[16px] font-bold text-[#581c87]">אנליטיקס — מבט על</h2>
        <p className="text-[12px] text-slate-600">מספרים שמדברים בעדינות, בלי להתייפייפ</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-[#9333EA]/15 bg-[#F9F5FF] p-3">
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">תרומות במערכת</p>
          <p className="mt-1 text-2xl font-black text-[#9333EA]">{totalRows}</p>
        </div>
        <div className="rounded-xl border border-[#ec4899]/20 bg-pink-50/60 p-3">
          <p className="text-[10px] font-bold text-slate-500">נאספו פיזית</p>
          <p className="mt-1 text-2xl font-black text-[#ec4899]">{pickedUpCount}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <p className="text-[10px] font-bold text-slate-500">הגיעו לעמותה</p>
          <p className="mt-1 text-2xl font-black text-slate-700">{deliveredToNgoCount}</p>
        </div>
        <div className="rounded-xl border border-[#9333EA]/15 bg-white p-3">
          <p className="text-[10px] font-bold text-slate-500">סכום ששולם (₪)</p>
          <p className="mt-1 text-2xl font-black text-[#581c87]">{paidTotal.toLocaleString("he-IL")}</p>
        </div>
      </div>
      <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3">
        <p className="text-[12px] font-bold text-slate-800">חלוקה לפי עמותה (בראש המועצה)</p>
        <ul className="mt-2 space-y-1.5 text-[12px]">
          {ngoDistribution.length === 0 ? <li className="text-slate-500">אין עדיין נתונים — נשתה קפה ונחזור</li> : null}
          {ngoDistribution.map((n) => (
            <li key={n.name} className="flex justify-between gap-2 border-b border-slate-100 pb-1 last:border-0">
              <span className="truncate font-medium text-slate-800">{n.name}</span>
              <span className="shrink-0 font-bold text-[#9333EA]">{n.count}</span>
            </li>
          ))}
        </ul>
      </div>
      <p className="text-center text-[11px] text-slate-600">
        מהירות ממוצעת (יצירה → הגיע לעמותה):{" "}
        <span className="font-bold text-[#581c87]">{avgDaysPickupToDelivered !== null ? `${avgDaysPickupToDelivered} ימים` : "אין מספיק תאריכי מסירה"}</span>
      </p>
    </div>
  );
}
