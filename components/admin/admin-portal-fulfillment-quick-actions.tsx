"use client";

import { Button } from "@/components/ui/button";
import type { AdminDashboardRole } from "@/lib/admin-role-types";
import type { AdminDonationPatch, AdminDonationRow } from "@/hooks/useAdminDonations";
import {
  adminPortalStageLabelHe,
  canAdminMarkKitDeliveredToCustomer,
  canAdminMarkKitShipped,
} from "@/lib/admin-portal-fulfillment-actions";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { useState } from "react";

type Props = {
  r: AdminDonationRow;
  role: AdminDashboardRole;
  onUpdate: (id: string, patch: AdminDonationPatch) => Promise<boolean>;
};

export function AdminPortalFulfillmentQuickActions({ r, role, onUpdate }: Props) {
  const can = role === "admin" || role === "office";
  const [busy, setBusy] = useState<"ship" | "delivered" | null>(null);

  if (!can) return null;

  const showShip = canAdminMarkKitShipped(r);
  const showDelivered = canAdminMarkKitDeliveredToCustomer(r);
  if (!showShip && !showDelivered) return null;

  async function run(kind: "ship" | "delivered") {
    setBusy(kind);
    try {
      if (kind === "ship") {
        await onUpdate(r.id, { portal_fulfillment_stage: "kit_in_transit" });
      } else {
        await onUpdate(r.id, { portal_fulfillment_stage: "kit_delivered" });
      }
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="rounded-xl border border-violet-200 bg-white px-3 py-2" dir="rtl" lang="he">
      <p className="text-[10px] font-bold text-[#581c87]">סנכרון לאזור האישי</p>
      <p className="mt-0.5 text-[11px] text-slate-600">
        שלב מוצג ללקוח: <span className="font-semibold text-[#9333EA]">{adminPortalStageLabelHe(r)}</span>
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {showShip ? (
          <Button
            type="button"
            size="sm"
            disabled={busy !== null}
            className={cn("h-8 rounded-full bg-[#9333EA] text-[11px] font-bold text-white hover:bg-[#7c3aed]")}
            onClick={() => void run("ship")}
          >
            {busy === "ship" ? (
              <span className="inline-flex items-center gap-1.5">
                <Loader2 className="size-3.5 animate-spin" aria-hidden />
                מעדכן…
              </span>
            ) : (
              "הערכה נשלחה"
            )}
          </Button>
        ) : null}
        {showDelivered ? (
          <Button
            type="button"
            size="sm"
            disabled={busy !== null}
            variant="outline"
            className="h-8 rounded-full border-[#ec4899]/50 text-[11px] font-bold text-[#be185d] hover:bg-pink-50"
            onClick={() => void run("delivered")}
          >
            {busy === "delivered" ? (
              <span className="inline-flex items-center gap-1.5">
                <Loader2 className="size-3.5 animate-spin" aria-hidden />
                מעדכן…
              </span>
            ) : (
              "הערכה הגיעה ללקוח"
            )}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
