"use client";

import { useEffect } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

/**
 * כשתרומה מקושרת לחשבון מתעדכנת (אדמין, וובהוק וכו׳), טוענים מחדש את רשימת ההזמנות
 * כדי שבר ההתקדמות באזור האישי יתעדכן בלי כפתור ידני.
 * דורש ש־`donations` יהיה ב־publication של Supabase Realtime (ראו מיגרציה).
 */
export function usePortalDonationsLiveRefresh(
  userId: string | null,
  loadAll: (uid: string) => Promise<unknown>,
): void {
  useEffect(() => {
    if (!userId) return;
    const supabase = createSupabaseBrowserClient();
    let debounceTimer: ReturnType<typeof setTimeout> | undefined;
    const schedule = () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        void loadAll(userId);
      }, 400);
    };
    const channel = supabase
      .channel(`portal-donations-live-${userId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "donations", filter: `customer_user_id=eq.${userId}` },
        schedule,
      )
      .subscribe();
    const onVis = () => {
      if (document.visibilityState === "visible") schedule();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      if (debounceTimer) clearTimeout(debounceTimer);
      void supabase.removeChannel(channel);
    };
  }, [userId, loadAll]);
}
