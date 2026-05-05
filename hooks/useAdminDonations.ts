"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { formatToyItemsForAdmin } from "@/lib/admin-donation-display";
import { computeLogisticsAnalytics } from "@/lib/admin-logistics-analytics";

export type AdminDonationPatch = {
  payment_status?: string;
  letter_status?: string;
  pickup_date?: string | null;
  pickup_time?: string | null;
  pickup_address?: string | null;
  /** מיפוי ל־`pickup_address` בשרת */
  pickup_location?: string | null;
  pickup_status?: string;
  delivery_status?: string;
  target_ngo_name?: string | null;
  /** מיפוי ל־`target_ngo_name` בשרת */
  ngo_name?: string | null;
  target_ngo_city?: string | null;
  delivery_time?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  child_name?: string | null;
  pickup_notes?: string | null;
  door_code?: string | null;
};

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
  pickup_date: string | null;
  pickup_time: string | null;
  pickup_address: string | null;
  /** כתובת/מיקום איסוף לתצוגה — מחושב מ־pickup_address או address */
  pickup_location: string | null;
  pickup_status: string | null;
  delivery_status: string | null;
  target_ngo_name: string | null;
  /** שם עמותה לתצוגה — מחושב מ־target_ngo_name */
  ngo_name: string | null;
  target_ngo_city: string | null;
  delivery_time: string | null;
};

/** שורה מה־API לפני נרמול (ללא שדות מחושבים) */
export type AdminDonationApiRow = Omit<AdminDonationRow, "pickup_location" | "ngo_name"> &
  Partial<Pick<AdminDonationRow, "pickup_location" | "ngo_name">>;

/** מנרמל שורה מה־API כולל `pickup_location` ו־`ngo_name` לתצוגה */
export function normalizeAdminDonationRow(raw: AdminDonationApiRow): AdminDonationRow {
  const pickup_location = raw.pickup_address ?? raw.address ?? null;
  const ngo_name = raw.target_ngo_name ?? null;
  return { ...raw, pickup_location, ngo_name };
}

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
    "pickup_date",
    "pickup_time",
    "pickup_location",
    "pickup_address",
    "pickup_status",
    "delivery_status",
    "ngo_name",
    "target_ngo_name",
    "target_ngo_city",
    "delivery_time",
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
        r.pickup_date ?? "",
        r.pickup_time ?? "",
        r.pickup_location ?? "",
        r.pickup_address ?? "",
        r.pickup_status ?? "",
        r.delivery_status ?? "",
        r.ngo_name ?? "",
        r.target_ngo_name ?? "",
        r.target_ngo_city ?? "",
        r.delivery_time ?? "",
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

function patchToApiBody(id: string, patch: AdminDonationPatch): Record<string, unknown> {
  const { pickup_location, ngo_name, ...rest } = patch;
  const body: Record<string, unknown> = { id, ...rest };
  if (pickup_location !== undefined) body.pickup_address = pickup_location;
  if (ngo_name !== undefined) body.target_ngo_name = ngo_name;
  return body;
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
      const data = (await res.json()) as { donations?: AdminDonationApiRow[]; error?: string };
      if (!res.ok) {
        setError(data.error ?? "שגיאה בטעינה");
        setRows([]);
        return;
      }
      setNeedLogin(false);
      const list = Array.isArray(data.donations) ? data.donations : [];
      setRows(list.map((r) => normalizeAdminDonationRow(r)));
    } catch {
      setError("בעיית רשת");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (password: string, email?: string) => {
    setError(null);
    const body =
      email !== undefined && email.trim() !== ""
        ? { email: email.trim(), password }
        : { password };
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
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

  const updateDonation = useCallback(async (id: string, patch: AdminDonationPatch) => {
    setError(null);
    const res = await fetch("/api/admin/update-donation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(patchToApiBody(id, patch)),
    });
    const data = (await res.json()) as { error?: string };
    if (!res.ok) {
      setError(data.error ?? "העדכון נכשל");
      return false;
    }
    await refresh();
    return true;
  }, [refresh]);

  const exportCsv = useCallback(() => {
    exportDonationsToCsv(rows);
  }, [rows]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const analytics = useMemo(() => computeLogisticsAnalytics(rows), [rows]);

  return {
    rows,
    analytics,
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
