"use client";

import { AdminLogisticsAnalytics } from "@/components/admin/AdminLogisticsAnalytics";
import { AdminLogisticsFilterBar } from "@/components/admin/AdminLogisticsFilterBar";
import { DonationTable } from "@/components/admin/DonationTable";
import { UserManagement } from "@/components/admin/UserManagement";
import type { AdminDonationRow } from "@/hooks/useAdminDonations";
import type { AdminAccountRole } from "@/hooks/useAdminSession";
import type { LogisticsAnalytics } from "@/lib/admin-logistics-analytics";
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
  { id: "today", label: "משלוחים היום", sub: "מה שמתוכנן להיום, בלי כישלונות איסוף" },
  { id: "letters", label: "מכתבים", sub: "כבר אצל העמותה — מחכים למכתב" },
  { id: "archive", label: "ארכיון", sub: "סגור וחתום — מכתב נשלח והגיע" },
];

const DONATION_KEYS = new Set<TabKey>(["all", "today", "letters", "archive"]);

const EMPTY_FILTERS: DonationMultiFilterState = { cities: [], pickupStatuses: [], letterStatuses: [] };

type Props = {
  role: AdminDashboardRole;
  accountRole: AdminAccountRole;
  rows: AdminDonationRow[];
  analytics: LogisticsAnalytics;
  onUpdate: (id: string, patch: import("@/hooks/useAdminDonations").AdminDonationPatch) => Promise<boolean>;
  onQuickView: (row: AdminDonationRow) => void;
  onExport: () => void;
};

export function AdminDashboardTabs({ role, accountRole, rows, analytics, onUpdate, onQuickView, onExport }: Props) {
  const [tab, setTab] = useState<TabKey>("all");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<DonationMultiFilterState>(EMPTY_FILTERS);
  const [teamNotify, setTeamNotify] = useState<string | null>(null);

  const showTeamTab = role === "admin" || accountRole === "superadmin";
  const showAnalyticsTab = role === "admin";
  const showDonationChrome = role !== "driver";

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

  return (
    <div className="space-y-4">
      {showDonationChrome ? (
        <div className="rounded-2xl border border-[#9333EA]/15 bg-white/80 p-3 shadow-sm">
          <p className="text-[11px] font-bold text-[#581c87]">
            {role === "office" && "היי משרד — מכתבים ותיקוני תורם, בלי בירוקרטיה"}
            {role === "admin" && "היי בוסית — שישה טאבים, שני פסי התקדמות, מצב רוח פרימיום"}
          </p>
        </div>
      ) : (
        <h2 className="text-center text-[15px] font-bold text-[#581c87]">האיסופים של היום</h2>
      )}

      {showDonationChrome && DONATION_KEYS.has(tab) ? (
        <AdminLogisticsFilterBar allRows={rows} filters={filters} onChange={setFilters} search={search} onSearch={setSearch} />
      ) : null}

      {showDonationChrome ? (
        <div role="tablist" className="flex flex-wrap gap-2 border-b border-[#9333EA]/15 pb-2" aria-label="אזורי ניהול">
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
          {showAnalyticsTab ? (
            <button
              type="button"
              role="tab"
              aria-selected={tab === "analytics"}
              className={cn(
                "rounded-xl px-3 py-2 text-[12px] font-bold",
                tab === "analytics" ? "bg-[#9333EA] text-white shadow" : "bg-white text-[#581c87] ring-1 ring-[#9333EA]/20",
              )}
              onClick={() => setTab("analytics")}
            >
              אנליטיקס
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

      {tab === "analytics" && showAnalyticsTab ? <AdminLogisticsAnalytics analytics={analytics} /> : null}

      {DONATION_KEYS.has(tab) ? (
        <DonationTable
          role={role}
          rows={filtered}
          onUpdate={onUpdate}
          onQuickView={onQuickView}
          onExport={onExport}
          variant={tab === "all" ? "all" : "default"}
          showProgress
        />
      ) : null}
    </div>
  );
}
