"use client";

import { AdminDonationQuickView } from "@/components/admin/AdminDonationQuickView";
import { AdminDashboardTabs } from "@/components/admin/AdminDashboardTabs";
import { AdminLoginPanel } from "@/components/admin/AdminLoginPanel";
import type { AdminDonationRow } from "@/hooks/useAdminDonations";
import { useAdminDonations } from "@/hooks/useAdminDonations";
import { useAdminSession } from "@/hooks/useAdminSession";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export function AdminDashboardClient() {
  const { rows, loading, error, needLogin, login, logout, updateDonation, exportCsv } = useAdminDonations();
  const { role, accountRole, loading: sessionLoading, refreshSession } = useAdminSession();
  const [quickRow, setQuickRow] = useState<AdminDonationRow | null>(null);

  useEffect(() => {
    if (!needLogin) void refreshSession();
  }, [needLogin, refreshSession]);

  async function handleLogin(password: string, email?: string) {
    const ok = await login(password, email);
    if (ok) await refreshSession();
    return ok;
  }

  const effectiveRole = role ?? "admin";
  const effectiveAccountRole = accountRole ?? "admin";

  if (needLogin && !loading && rows.length === 0) {
    return (
      <div className="min-h-[70vh] bg-[#F9F5FF] px-4 py-12" dir="rtl" lang="he">
        <div className="mx-auto max-w-lg text-center">
          <h1 className="text-[16px] font-bold text-[#581c87]">נפרדים בחיוך — ניהול</h1>
          <p className="mt-1 text-[12px] text-slate-600">אזור מאובטח לצוות בלבד</p>
        </div>
        <div className="mx-auto mt-8 max-w-lg">
          <AdminLoginPanel onLogin={handleLogin} error={error} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F5FF] pb-16 pt-8" dir="rtl" lang="he">
      <header className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4">
        <div>
          <h1 className="text-[16px] font-bold text-[#581c87]">לוגיסטיקה ותרומות</h1>
          <p className="text-[12px] text-slate-600">
            {sessionLoading ? "טוענים הרשאות…" : `מחוברים כ־${effectiveRole === "driver" ? "נהג/ת" : effectiveRole === "office" ? "משרד" : "אדמין"}`}
          </p>
        </div>
        <Button type="button" variant="outline" className="rounded-xl border-slate-300 text-[12px]" onClick={() => void logout()}>
          יציאה
        </Button>
      </header>

      <main className="mx-auto mt-8 max-w-6xl px-4">
        {error && rows.length > 0 ? (
          <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-center text-[12px] text-red-800" role="alert">
            {error}
          </p>
        ) : null}
        {loading ? (
          <p className="text-center text-[14px] text-slate-600">טוענים נתונים…</p>
        ) : error && rows.length === 0 && !needLogin ? (
          <p className="text-center text-[14px] text-red-700" role="alert">
            {error}
          </p>
        ) : (
          <AdminDashboardTabs
            role={effectiveRole}
            accountRole={effectiveAccountRole}
            rows={rows}
            onUpdate={updateDonation}
            onQuickView={setQuickRow}
            onExport={exportCsv}
          />
        )}
      </main>

      {quickRow ? <AdminDonationQuickView row={quickRow} onClose={() => setQuickRow(null)} /> : null}
    </div>
  );
}
