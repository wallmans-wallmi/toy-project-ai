"use client";

import { useCallback, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { isPostgrestMissingResourceError } from "@/lib/portal/postgrest-missing-resource";
import type { CustomerProfileRow, PortalCustomerProfile, PortalDonationOrder, PortalOrderSelectRow } from "@/lib/portal/types";
import { donationRowToPortalOrder, profileRowToPortal, portalProfileToRowPatch } from "@/lib/portal/types";

export type PortalBootstrapLoadResult = {
  hasProfile: boolean;
  /** מספר הזמנות שמקושרות ל־customer_user_id (אחרי טעינה) */
  orderCount: number;
  /** false כשטבלת customer_profiles (או משאב קשור) לא קיימת בפרויקט — אל תנסו sync מהשרת */
  portalSchemaReady: boolean;
};

const PROFILE_SELECT = "*";
const ORDER_SELECT =
  "id,order_number,created_at,payment_status,pickup_status,letter_status,scheduled_region,scheduled_slot,pickup_city,toy_items,pickup_date,pickup_slot_id,child_name,journey_type,amount_paid,portal_fulfillment_stage,portal_kit_delivered_sms_at,delivery_status,invoice_url";

export function useCustomerPortalData() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<PortalCustomerProfile | null>(null);
  const [orders, setOrders] = useState<PortalDonationOrder[]>([]);

  const loadAll = useCallback(async (userId: string, opts?: { clearError?: boolean }): Promise<PortalBootstrapLoadResult> => {
    setLoading(true);
    if (opts?.clearError !== false) setError(null);
    let hasProfile = false;
    let orderCount = 0;
    try {
      const supabase = createSupabaseBrowserClient();
      const { data: prof, error: pErr } = await supabase
        .from("customer_profiles")
        .select(PROFILE_SELECT)
        .eq("user_id", userId)
        .maybeSingle();
      if (pErr) {
        const msg = String(pErr.message ?? "");
        const code = "code" in pErr ? String((pErr as { code?: string }).code) : "";
        const status = "status" in pErr ? Number((pErr as { status?: number }).status) : 0;
        const missing = isPostgrestMissingResourceError(pErr);
        if (
          missing ||
          msg.includes("relation") ||
          msg.includes("does not exist") ||
          code === "42P01" ||
          status === 404 ||
          /not\s*found/i.test(msg)
        ) {
          setError(
            missing
              ? "חסרה טבלת customer_profiles בפרויקט Supabase: פתחו SQL Editor והריצו את הקובץ supabase/manual/customer_profiles_portal_bootstrap.sql (או מיגרציות supabase/migrations)"
              : "טבלת הפרופילים לא זמינה במסד: הריצו מיגרציות Supabase או בדקו את ה־RLS",
          );
        } else {
          setError("לא ניתן לטעון את הפרופיל");
        }
        return { hasProfile: false, orderCount: 0, portalSchemaReady: !missing };
      }
      if (prof) {
        hasProfile = true;
        setProfile(profileRowToPortal(prof as CustomerProfileRow));
      } else {
        setProfile(null);
      }

      const { data: ord, error: oErr } = await supabase
        .from("donations")
        .select(ORDER_SELECT)
        .eq("customer_user_id", userId)
        .order("created_at", { ascending: false });
      if (oErr) {
        if (isPostgrestMissingResourceError(oErr)) {
          setError(
            "חסרה עמודה או טבלה ב־donations עבור הפורטל: הריצו את מיגרציות Supabase (למשל customer_user_id, portal_fulfillment_stage)",
          );
          return { hasProfile, orderCount: 0, portalSchemaReady: false };
        }
        setError("לא ניתן לטעון את ההזמנות");
        return { hasProfile, orderCount: 0, portalSchemaReady: true };
      }
      const mapped = ((ord ?? []) as PortalOrderSelectRow[]).map(donationRowToPortalOrder);
      orderCount = mapped.length;
      setOrders(mapped);
      return { hasProfile, orderCount, portalSchemaReady: true };
    } catch {
      setError("בעיית רשת או שרת: נסו שוב בעוד רגע");
      return { hasProfile: false, orderCount: 0, portalSchemaReady: true };
    } finally {
      setLoading(false);
    }
  }, []);

  const saveProfile = useCallback(async (patch: Partial<PortalCustomerProfile>, userId: string) => {
    setError(null);
    try {
      const supabase = createSupabaseBrowserClient();
      const rowPatch = portalProfileToRowPatch(patch);
      if (Object.keys(rowPatch).length === 0) return { ok: true as const };
      const { error: uErr } = await supabase
        .from("customer_profiles")
        .update({ ...rowPatch, updated_at: new Date().toISOString() })
        .eq("user_id", userId);
      if (uErr) {
        setError("לא ניתן לשמור את השינויים");
        return { ok: false as const };
      }
      setProfile((prev) => (prev ? { ...prev, ...patch } : prev));
      return { ok: true as const };
    } catch {
      setError("בעיית רשת בשמירה: נסו שוב");
      return { ok: false as const };
    }
  }, []);

  return { loading, error, setError, profile, setProfile, orders, loadAll, saveProfile };
}
