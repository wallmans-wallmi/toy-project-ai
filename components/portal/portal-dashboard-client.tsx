"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useCustomerPortalData } from "@/hooks/use-customer-portal-data";
import { usePortalDonationsLiveRefresh } from "@/hooks/use-portal-donations-live-refresh";
import { requestPortalCustomerSync } from "@/hooks/use-portal-sync";
import { PortalAccountTabBar, type PortalAccountTabId } from "@/components/portal/account/portal-account-tab-bar";

function profileInitials(first: string, last: string): string {
  const a = first.trim().charAt(0);
  const b = last.trim().charAt(0);
  if (a && b) return `${a}${b}`;
  if (a) return a;
  if (b) return b;
  return "?";
}
import { PortalProfileTabPanel } from "@/components/portal/account/portal-profile-tab-panel";
import { PortalOrdersTabPanel } from "@/components/portal/account/portal-orders-tab-panel";
import { PortalSettingsTabPanel } from "@/components/portal/account/portal-settings-tab-panel";

function tabFromQuery(raw: string | null): PortalAccountTabId {
  if (raw === "orders" || raw === "settings" || raw === "profile") return raw;
  return "profile";
}

export function PortalDashboardClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loading, error, setError, profile, orders, loadAll, saveProfile } = useCustomerPortalData();
  const [userId, setUserId] = useState<string | null>(null);
  const [tab, setTab] = useState<PortalAccountTabId>(() => tabFromQuery(searchParams.get("tab")));
  const [bootstrapping, setBootstrapping] = useState(true);
  const portalLiveUserId = userId && !bootstrapping && !loading ? userId : null;
  usePortalDonationsLiveRefresh(portalLiveUserId, loadAll);

  useEffect(() => {
    setTab(tabFromQuery(searchParams.get("tab")));
  }, [searchParams]);

  const setTabAndUrl = useCallback(
    (next: PortalAccountTabId) => {
      setTab(next);
      router.replace(`/account/dashboard?tab=${next}`, { scroll: false });
    },
    [router],
  );

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setBootstrapping(true);
      setError(null);
      try {
        const supabase = createSupabaseBrowserClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          if (!cancelled) setBootstrapping(false);
          router.replace("/account/login");
          return;
        }
        if (cancelled) return;
        setUserId(user.id);
        const first = await loadAll(user.id);
        if (cancelled) return;
        if (!first.portalSchemaReady) {
          return;
        }
        /** קישור תרומות לפי טלפון (05… מול +972…) ועדכון שם בפרופיל — תמיד אחרי טעינה ראשונה */
        const sync = await requestPortalCustomerSync();
        if (!cancelled) {
          await loadAll(user.id, { clearError: sync.ok });
          if (!sync.ok) {
            setError(sync.message);
          }
        }
      } catch {
        if (!cancelled) {
          setError("אירעה שגיאה בטעינת החשבון: נסו לרענן את הדף");
        }
      } finally {
        if (!cancelled) setBootstrapping(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router, loadAll, setError]);

  if (!userId || bootstrapping || loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-slate-600" dir="rtl" lang="he">
        טוענים…
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center text-sm text-amber-950" dir="rtl" lang="he">
        לא נטען פרופיל. נסו לרענן או פנו לתמיכה.
        {error ? <span className="mt-2 block text-red-800">{error}</span> : null}
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[520px] space-y-0 px-3 py-6 sm:px-4 sm:py-8" dir="rtl" lang="he">
      <div className="overflow-hidden rounded-2xl border border-violet-100 bg-white shadow-[0_8px_40px_rgba(31,41,55,0.08)] sm:rounded-3xl">
        <div className="bg-gradient-to-br from-[#9333EA] to-[#7C3AED] px-5 py-7 text-white sm:px-6 sm:py-7">
          <div className="flex items-center gap-4">
            <div
              className="flex size-[52px] shrink-0 items-center justify-center rounded-full border-2 border-white/40 bg-white/20 text-xl font-extrabold text-white"
              aria-hidden
            >
              {profileInitials(profile.firstName, profile.lastName)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[0.72rem] font-bold uppercase tracking-wider text-white/80">החשבון שלי</p>
              <h1 className="mt-0.5 truncate text-lg font-extrabold leading-tight sm:text-xl">
                {profile.firstName} {profile.lastName}
              </h1>
              <p className="mt-1 text-[0.82rem] text-white/80" dir="ltr">
                {profile.phone}
              </p>
            </div>
          </div>
        </div>

        <PortalAccountTabBar active={tab} onChange={setTabAndUrl} />
      </div>

      <header className="px-1 pt-5 sm:px-0">
        <p className="text-xs text-neutral-500">ניהול פרופיל, הזמנות והגדרות</p>
      </header>

      <div className="space-y-6 px-1 pt-4 sm:px-0">
        {tab === "profile" ? (
          <PortalProfileTabPanel profile={profile} userId={userId} saveProfile={saveProfile} onSaved={() => void loadAll(userId)} />
        ) : null}
        {tab === "orders" ? <PortalOrdersTabPanel orders={orders} onOrdersRefresh={() => void loadAll(userId)} /> : null}
        {tab === "settings" ? (
          <PortalSettingsTabPanel profile={profile} userId={userId} saveProfile={saveProfile} onSaved={() => void loadAll(userId)} />
        ) : null}

        {error ? <p className="text-center text-xs text-red-700">{error}</p> : null}
      </div>
    </div>
  );
}
