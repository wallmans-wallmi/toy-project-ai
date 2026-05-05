"use client";

import type { AdminDashboardRole } from "@/lib/admin-role-types";
import { useCallback, useEffect, useState } from "react";

export type AdminAccountRole = "admin" | "superadmin";

export function useAdminSession() {
  const [role, setRole] = useState<AdminDashboardRole | null>(null);
  const [accountRole, setAccountRole] = useState<AdminAccountRole | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshSession = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/me", { credentials: "include" });
      if (res.status === 401) {
        setRole(null);
        setAccountRole(null);
        setEmail(null);
        return;
      }
      const data = (await res.json()) as {
        role?: AdminDashboardRole;
        email?: string | null;
        accountRole?: AdminAccountRole;
      };
      setRole(data.role ?? "admin");
      setAccountRole(data.accountRole ?? "admin");
      setEmail(data.email ?? null);
    } catch {
      setRole("admin");
      setAccountRole("admin");
      setEmail(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  return { role, accountRole, email, loading, refreshSession };
}
