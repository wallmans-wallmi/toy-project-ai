"use client";

import { DonationTable } from "@/components/admin/DonationTable";
import { UserManagement } from "@/components/admin/UserManagement";
import type { AdminDonationRow } from "@/hooks/useAdminDonations";
import type { AdminAccountRole } from "@/hooks/useAdminSession";
import type { AdminDashboardRole } from "@/lib/admin-role-types";
import type { DashboardTabId } from "@/lib/admin-donation-tab-filters";
import { filterDonationsBySearch, filterDonationsByTab } from "@/lib/admin-donation-tab-filters";
import { cn } from "@/lib/utils";
import { useMemo, useState } from "react";

type ExtraTab = "team" | "analytics";
type TabKey = DashboardTabId | ExtraTab;

const CORE: { id: DashboardTabId; label: string; sub: string }[] = [
  { id: "todays_route", label: "מסלול היום", sub: "מה שנשאר לאסוף היום — בלי פאניקה" },
  { id: "logistics", label: "לוגיסטיקה", sub: "משלוחים חמים בדרך" },
  { id: "letters", label: "תור מכתבים", sub: "כבר אצל העמותה, מחכים למכתב" },
  { id: "archive", label: "ארכיון", sub: "כל השאר — לעיון ושקט" },
];

type Props = {
  role: AdminDashboardRole;
  accountRole: AdminAccountRole;
  rows: AdminDonationRow[];
  onUpdate: (id: string, patch: import("@/hooks/useAdminDonations").AdminDonationPatch) => Promise<boolean>;
  onQuickView: (row: AdminDonationRow) => void;
  onExport: () => void;
};

export function AdminDashboardTabs({ role, accountRole, rows, onUpdate, onQuickView, onExport }: Props) {
  const [tab, setTab] = useState<TabKey>("todays_route");
  const [search, setSearch] = useState("");
  const [teamNotify, setTeamNotify] = useState<string | null>(null);

  const showTeamTab = role === "admin" || accountRole === "superadmin";
  const showAnalyticsTab = role === "admin";

  const filtered = useMemo(() => {
    if (tab === "team" || tab === "analytics") return [];
    const base = role === "driver" ? rows : filterDonationsByTab(rows, tab as DashboardTabId);
    if (role === "office" && search.trim() && tab === "letters") return filterDonationsBySearch(base, search);
    if (role === "admin" && search.trim()) return filterDonationsBySearch(base, search);
    return base;
  }, [rows, tab, search, role]);

  const showSearch = role === "office" || role === "admin";

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-[#9333EA]/15 bg-white/80 p-3 shadow-sm">
        <p className="text-[11px] font-bold text-[#581c87]">
          {role === "driver" && "היי נהג/ת — רק המסלול של היום, שאר הטאבים לא בשבילנו"}
          {role === "office" && "היי משרד — מכתבים ותיקוני תורם, בלי בירוקרטיה"}
          {role === "admin" && "היי בוסית — פה הכול פתוח, כולל אנליטיקס (בקרוב slay)"}
        </p>
        {showSearch ? (
          <input
            type="search"
            placeholder={
              role === "office"
                ? "חיפוש בתור המכתבים (שם ילד, טלפון, אימייל)…"
                : "חיפוש בטאב הנוכחי — שם, טלפון, אימייל…"
            }
            className="mt-2 w-full rounded-xl border border-slate-200 bg-[#F9F5FF] px-3 py-2 text-[13px] outline-none focus:ring-2 focus:ring-[#9333EA]/40"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="חיפוש"
          />
        ) : null}
      </div>

      {role === "driver" ? (
        <h2 className="text-center text-[15px] font-bold text-[#581c87]">האיסופים של היום</h2>
      ) : (
        <div role="tablist" className="flex flex-wrap gap-2 border-b border-[#9333EA]/15 pb-2" aria-label="אזורי ניהול">
          {CORE.map((t) => (
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
      )}

      {role !== "driver" && tab !== "team" && tab !== "analytics" ? (
        <p className="text-center text-[11px] text-slate-500">{CORE.find((c) => c.id === tab)?.sub}</p>
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
        <div className="rounded-2xl border border-[#9333EA]/20 bg-[#F9F5FF] p-8 text-center">
          <p className="text-[15px] font-bold text-[#581c87]">אנליטיקס בדרך</p>
          <p className="mt-2 text-[12px] text-slate-600">בקרוב פה גרפים שיגידו לנו מי הכי נדבן — רגע לשתות קפה</p>
        </div>
      ) : null}

      {tab !== "team" && tab !== "analytics" ? (
        <DonationTable role={role} rows={filtered} onUpdate={onUpdate} onQuickView={onQuickView} onExport={onExport} />
      ) : null}
    </div>
  );
}
