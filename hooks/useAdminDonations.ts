"use client";

import { useCallback, useEffect, useState } from "react";
import { formatToyItemsForAdmin } from "@/lib/admin-donation-display";

export type AdminDonationRow = {
  id: string;
  created_at: string;
  first_name: string | null;
  last_name: string | null;
  child_name: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  journey_type: string | null;
  payment_status: string | null;
  letter_status: string | null;
  toy_items: unknown;
  toy_description: string | null;
  ai_generated_letter: string | null;
  scheduled_region: string | null;
  scheduled_slot: string | null;
  pickup_city: string | null;
  amount_paid: number | null;
  pickup_notes: string | null;
  door_code: string | null;
};

export function formatToyItemsLine(row: AdminDonationRow): string {
  return formatToyItemsForAdmin(row.toy_items);
}

export function exportDonationsToCsv(rows: AdminDonationRow[]): void {
  const headers = [
    "id",
    "created_at",
    "first_name",
    "last_name",
    "child_name",
    "phone",
    "email",
    "journey_type",
    "payment_status",
    "letter_status",
    "items_summary",
    "scheduled_region",
    "scheduled_slot",
    "pickup_city",
    "amount_paid",
  ];
  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const lines = [headers.join(",")];
  for (const r of rows) {
    const summary = formatToyItemsForAdmin(r.toy_items).replace(/\r?\n/g, " ");
    lines.push(
      [
        r.id,
        r.created_at,
        r.first_name ?? "",
        r.last_name ?? "",
        r.child_name ?? "",
        r.phone ?? "",
        r.email ?? "",
        r.journey_type ?? "",
        r.payment_status ?? "",
        r.letter_status ?? "",
        summary,
        r.scheduled_region ?? "",
        r.scheduled_slot ?? "",
        r.pickup_city ?? "",
        String(r.amount_paid ?? 0),
      ]
        .map((c) => escape(String(c)))
        .join(","),
    );
  }
  const blob = new Blob(["\uFEFF" + lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `donations-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function useAdminDonations() {
  const [rows, setRows] = useState<AdminDonationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [needLogin, setNeedLogin] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/donations", { credentials: "include" });
      if (res.status === 401) {
        setNeedLogin(true);
        setRows([]);
        return;
      }
      const data = (await res.json()) as { donations?: AdminDonationRow[]; error?: string };
      if (!res.ok) {
        setError(data.error ?? "שגיאה בטעינה");
        setRows([]);
        return;
      }
      setNeedLogin(false);
      setRows(Array.isArray(data.donations) ? data.donations : []);
    } catch {
      setError("בעיית רשת");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (password: string) => {
    setError(null);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
      credentials: "include",
    });
    const data = (await res.json()) as { error?: string };
    if (!res.ok) {
      setError(data.error ?? "התחברות נכשלה");
      return false;
    }
    await refresh();
    return true;
  }, [refresh]);

  const logout = useCallback(async () => {
    await fetch("/api/admin/logout", { method: "POST", credentials: "include" });
    setNeedLogin(true);
    setRows([]);
  }, []);

  const updateDonation = useCallback(
    async (id: string, patch: { payment_status?: string; letter_status?: string }) => {
      setError(null);
      const res = await fetch("/api/admin/update-donation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id, ...patch }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "העדכון נכשל");
        return false;
      }
      await refresh();
      return true;
    },
    [refresh],
  );

  const exportCsv = useCallback(() => {
    exportDonationsToCsv(rows);
  }, [rows]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    rows,
    loading,
    error,
    needLogin,
    refresh,
    login,
    logout,
    updateDonation,
    exportCsv,
  };
}
