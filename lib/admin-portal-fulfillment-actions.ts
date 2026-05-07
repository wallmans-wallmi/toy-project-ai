import type { AdminDonationRow } from "@/hooks/useAdminDonations";
import { isDonationPaymentCompletedValue } from "@/lib/donation-payment-status";
import { FUNNEL_ORDERED } from "@/lib/donation-funnel-stage";
import { isPortalFulfillmentStage, PORTAL_STAGE_LABELS, type PortalFulfillmentStage } from "@/lib/portal/fulfillment-stages";

function funnelIsOrdered(r: AdminDonationRow): boolean {
  const fs = (r.funnel_stage ?? "").trim();
  return fs === "" || fs === FUNNEL_ORDERED;
}

export function adminEffectivePortalStage(r: AdminDonationRow): PortalFulfillmentStage {
  const raw = (r.portal_fulfillment_stage ?? "").trim();
  if (raw && isPortalFulfillmentStage(raw)) return raw;
  return "request_received";
}

export function adminPortalStageLabelHe(r: AdminDonationRow): string {
  return PORTAL_STAGE_LABELS[adminEffectivePortalStage(r)];
}

export function canAdminMarkKitShipped(r: AdminDonationRow): boolean {
  if (!funnelIsOrdered(r)) return false;
  if (!isDonationPaymentCompletedValue(r.payment_status as string | null | undefined | boolean)) return false;
  const p = adminEffectivePortalStage(r);
  return p === "request_received";
}

export function canAdminMarkKitDeliveredToCustomer(r: AdminDonationRow): boolean {
  if (!funnelIsOrdered(r)) return false;
  if (!isDonationPaymentCompletedValue(r.payment_status as string | null | undefined | boolean)) return false;
  return adminEffectivePortalStage(r) === "kit_in_transit";
}
