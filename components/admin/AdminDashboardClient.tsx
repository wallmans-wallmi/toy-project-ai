"use client";

import { AdminDonationQuickView } from "@/components/admin/AdminDonationQuickView";
import { AdminLoginPanel } from "@/components/admin/AdminLoginPanel";
import { DonationTable } from "@/components/admin/DonationTable";
import type { AdminDonationRow } from "@/hooks/useAdminDonations";
import { useAdminDonations } from "@/hooks/useAdminDonations";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";

export function AdminDashboardClient() {
  const { rows, loading, error, needLogin, login, logout, updateDonation, exportCsv } = useAdminDonations();
  const [quickRow, setQuickRow] = useState<AdminDonationRow | null>(null);

  async function handleLogin(password: string, email?: string) {
    return login(password, email);
  }

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
          <h1 className="text-[16px] font-bold text-[#581c87]">ניהול תרומות ובקשות איסוף</h1>
          <p className="text-[12px] text-slate-600">רשימה מהמסד, עדכון סטטוסים וייצוא</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/users"
            className="inline-flex items-center justify-center rounded-xl border border-[#9333EA]/35 bg-white px-3 py-2 text-[12px] font-semibold text-[#581c87] transition-colors hover:bg-[#F9F5FF]"
          >
            משתמשי ניהול
          </Link>
          <Button type="button" variant="outline" className="rounded-xl border-slate-300 text-[12px]" onClick={() => void logout()}>
            יציאה
          </Button>
        </div>
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
          <DonationTable
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
