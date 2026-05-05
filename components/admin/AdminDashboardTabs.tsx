"use client";

import { AdminAnalyticsKpiHome } from "@/components/admin/AdminAnalyticsKpiHome";
import { AdminLogisticsAnalytics } from "@/components/admin/AdminLogisticsAnalytics";
import { AdminLogisticsFilterBar } from "@/components/admin/AdminLogisticsFilterBar";
import { DonationTable } from "@/components/admin/DonationTable";
import { UserManagement } from "@/components/admin/UserManagement";
import type { AdminDonationRow } from "@/hooks/useAdminDonations";
import type { AdminAccountRole } from "@/hooks/useAdminSession";
import { kpiNavigationFor, useAdminStats, type AdminKpiId } from "@/hooks/useAdminStats";
import { computeLogisticsAnalytics } from "@/lib/admin-logistics-analytics";
import type { AdminDashboardRole } from "@/lib/admin-role-types";
import {
  applyDonationMultiFilters,
  type DonationMultiFilterState,
  filterDonationsBySearch,
  filterRowsByLogisticsTab,
  type LogisticsDonationTabId,
} from "@/lib/admin-logistics-dashboard";
import { cn } from "@/lib/utils";
import { useMemo, useState } from "react";

type ExtraTab = "team" | "analytics";
type TabKey = LogisticsDonationTabId | ExtraTab;

const DONATION_TABS: { id: LogisticsDonationTabId; label: string; sub: string }[] = [
  { id: "all", label: "כל ההזמנות", sub: "הכול על השולחן — עם סינונים חכמים" },
  { id: "today", label: "מסלול היום", sub: "לפי שעת איסוף — כתובת, פריטים, חיוג, וסטטוס בכרטיס אחד" },
  { id: "letters", label: "מכתבים", sub: "תור אחרי תשלום והגעה לעמותה — צפייה, שליחה, הדפסה" },
  { id: "archive", label: "ארכיון", sub: "סגור וחתום — מכתב נשלח והגיע" },
];

const DONATION_KEYS = new Set<TabKey>(["all", "today", "letters", "archive"]);

const EMPTY_FILTERS: DonationMultiFilterState = { cities: [], pickupStatuses: [], letterStatuses: [], deliveryStatuses: [] };

type Props = {
  role: AdminDashboardRole;
  accountRole: AdminAccountRole;
  rows: AdminDonationRow[];
  onUpdate: (id: string, patch: import("@/hooks/useAdminDonations").AdminDonationPatch) => Promise<boolean>;
  onQuickView: (row: AdminDonationRow) => void;
  onExport: () => void;
};

export function AdminDashboardTabs({ role, accountRole, rows, onUpdate, onQuickView, onExport }: Props) {
  const showTeamTab = role === "admin" || accountRole === "superadmin";
  const showAnalyticsTab = role === "admin";
  const showDonationChrome = role !== "driver";

  const [tab, setTab] = useState<TabKey>(() => (showAnalyticsTab ? "analytics" : "all"));
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<DonationMultiFilterState>(EMPTY_FILTERS);
  const [teamNotify, setTeamNotify] = useState<string | null>(null);

  const { dateRange, setDateRange, kpiRows, kpis, setTodayIsrael, clearDateRange } = useAdminStats({ rows });

  const scopedAnalytics = useMemo(() => computeLogisticsAnalytics(kpiRows), [kpiRows]);

  const baseByTab = useMemo(() => {
    if (!DONATION_KEYS.has(tab)) return [];
    if (role === "driver") return rows;
    return filterRowsByLogisticsTab(rows, tab as LogisticsDonationTabId);
  }, [rows, tab, role]);

  const afterMulti = useMemo(() => {
    if (role === "driver") return baseByTab;
    return applyDonationMultiFilters(baseByTab, filters);
  }, [baseByTab, filters, role]);

  const filtered = useMemo(() => {
    if (!DONATION_KEYS.has(tab)) return [];
    const q = search.trim();
    if (!q) return afterMulti;
    return filterDonationsBySearch(afterMulti, q);
  }, [afterMulti, search, tab]);

  function handleKpiNavigate(id: AdminKpiId) {
    const { tab: t, filters: f } = kpiNavigationFor(id);
    setFilters(f);
    setTab(t);
  }

  return (
    <div className="space-y-4">
      {!showDonationChrome ? <h2 className="text-center text-[16px] font-bold text-[#9333EA]">מסלול היום</h2> : null}

      {showDonationChrome && DONATION_KEYS.has(tab) ? (
        <AdminLogisticsFilterBar allRows={rows} filters={filters} onChange={setFilters} search={search} onSearch={setSearch} />
      ) : null}

      {showDonationChrome ? (
        <div role="tablist" className="flex flex-wrap gap-2 border-b border-[#9333EA]/15 pb-2" aria-label="אזורי ניהול">
          {showAnalyticsTab ? (
            <button
              type="button"
              role="tab"
              aria-selected={tab === "analytics"}
              className={cn(
                "rounded-xl px-3 py-2 text-[12px] font-bold transition-colors",
                tab === "analytics" ? "bg-[#9333EA] text-white shadow" : "bg-white text-[#581c87] ring-1 ring-[#9333EA]/20 hover:bg-[#F9F5FF]",
              )}
              onClick={() => setTab("analytics")}
            >
              סקירה
            </button>
          ) : null}
          {DONATION_TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              className={cn(
                "rounded-xl px-3 py-2 text-[12px] font-bold transition-colors",
                tab === t.id ? "bg-[#9333EA] text-white shadow" : "bg-white text-[#581c87] ring-1 ring-[#9333EA]/20 hover:bg-[#F9F5FF]",
              )}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
          {showTeamTab ? (
            <button
              type="button"
              role="tab"
              aria-selected={tab === "team"}
              className={cn(
                "rounded-xl px-3 py-2 text-[12px] font-bold",
                tab === "team" ? "bg-[#9333EA] text-white shadow" : "bg-white text-[#581c87] ring-1 ring-[#9333EA]/20",
              )}
              onClick={() => {
                setTeamNotify(null);
                setTab("team");
              }}
            >
              צוות
            </button>
          ) : null}
        </div>
      ) : null}

      {showDonationChrome && DONATION_KEYS.has(tab) ? (
        <p className="text-center text-[11px] text-slate-500">{DONATION_TABS.find((c) => c.id === tab)?.sub}</p>
      ) : null}

      {tab === "team" && showTeamTab ? (
        <div className="space-y-3">
          {teamNotify ? (
            <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-center text-[12px] font-medium text-emerald-900" role="status">
              {teamNotify}
            </p>
          ) : null}
          <UserManagement onNotify={setTeamNotify} />
        </div>
      ) : null}

      {tab === "analytics" && showAnalyticsTab ? (
        <div className="space-y-4">
          <AdminAnalyticsKpiHome
            kpis={kpis}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            onToday={setTodayIsrael}
            onClearRange={clearDateRange}
            onKpiClick={handleKpiNavigate}
          />
          <AdminLogisticsAnalytics analytics={scopedAnalytics} />
        </div>
      ) : null}

      {DONATION_KEYS.has(tab) ? (
        <DonationTable
          role={role}
          rows={filtered}
          onUpdate={onUpdate}
          onQuickView={onQuickView}
          onExport={onExport}
          variant={tab === "all" ? "all" : "default"}
          showProgress
          layout={role === "driver" || tab === "today" ? "todaysRoute" : tab === "letters" ? "letters" : "default"}
        />
      ) : null}
    </div>
  );
}
