import { isDeferredPickupSchedulingRegion } from "@/lib/pickup-regions";

export const PORTAL_FULFILLMENT_STAGES = [
  "request_received",
  "kit_in_transit",
  "kit_delivered",
  "pickup_scheduled",
  "courier_en_route",
  "collected",
  "donated",
] as const;

export type PortalFulfillmentStage = (typeof PORTAL_FULFILLMENT_STAGES)[number];

export const PORTAL_STAGE_LABELS: Record<PortalFulfillmentStage, string> = {
  request_received: "קיבלנו את הבקשה",
  kit_in_transit: "ערכת האריזה בדרך",
  kit_delivered: "ערכת האריזה הגיעה",
  pickup_scheduled: "תואם איסוף",
  courier_en_route: "השליח בדרך",
  collected: "המשלוח נאסף",
  donated: "המשלוח נתרם",
};

export function isPortalFulfillmentStage(value: string): value is PortalFulfillmentStage {
  return (PORTAL_FULFILLMENT_STAGES as readonly string[]).includes(value);
}

export function stageIndex(stage: PortalFulfillmentStage): number {
  return PORTAL_FULFILLMENT_STAGES.indexOf(stage);
}

/** השוואה: שלילי אם a לפני b בצינור */
export function comparePortalStages(a: PortalFulfillmentStage, b: PortalFulfillmentStage): number {
  return stageIndex(a) - stageIndex(b);
}

export type DonationStageSource = {
  portal_fulfillment_stage: string | null;
  payment_status: string | null;
  pickup_status: string | null;
  delivery_status: string | null;
  pickup_date: string | null;
  pickup_slot_id: string | null;
  scheduled_region: string | null;
};

function maxStage(a: PortalFulfillmentStage, b: PortalFulfillmentStage): PortalFulfillmentStage {
  return comparePortalStages(a, b) >= 0 ? a : b;
}

/**
 * שלב אפקטיבי לתצוגת בר התקדמות: לוגיסטיקה קיימת + ערך portal_fulfillment_stage (לא מדלג אוטומטית ל־kit_delivered).
 */
export function deriveEffectiveFulfillmentStage(row: DonationStageSource): PortalFulfillmentStage {
  /** שלב ערכה (בדרך / הגיעה) נקבע רק מ־`portal_fulfillment_stage` אחרי פעולה באדמין, לא אוטומטית אחרי תשלום */
  let base: PortalFulfillmentStage = "request_received";
  const hasRealPickup =
    Boolean(row.pickup_date?.trim()) &&
    Boolean(row.pickup_slot_id?.trim()) &&
    Boolean(row.scheduled_region) &&
    !isDeferredPickupSchedulingRegion(row.scheduled_region ?? "");
  if (hasRealPickup) {
    base = maxStage(base, "pickup_scheduled");
  }
  if (row.pickup_status === "picked_up") {
    base = maxStage(base, "collected");
  }
  if (row.delivery_status === "delivered") {
    base = maxStage(base, "donated");
  }

  const raw = row.portal_fulfillment_stage?.trim();
  if (raw && isPortalFulfillmentStage(raw)) {
    return maxStage(base, raw);
  }
  return base;
}

/** כפתור תיאום איסוף: רק כשהמערכת סימנה במפורש שהערכה הגיעה */
export function canShowSchedulePickupButton(row: DonationStageSource): boolean {
  return row.portal_fulfillment_stage?.trim() === "kit_delivered";
}

/** עריכת מועד אחרי תיאום (לפני יציאת השליח) */
export function canEditPickupSchedule(row: DonationStageSource): boolean {
  return row.portal_fulfillment_stage?.trim() === "pickup_scheduled";
}

/** סימולציה: הודעת SMS לתיאום איסוף — רלוונטי כל עוד השלב במסד הוא kit_delivered */
export function showKitDeliveredSmsPrompt(row: DonationStageSource): boolean {
  return row.portal_fulfillment_stage?.trim() === "kit_delivered";
}

/** מיפוי מודל פורטל לשדות לוגיקת שלבים */
export function donationStageSourceFromPortalOrder(o: {
  portalFulfillmentStage: string | null;
  paymentStatus: string;
  pickupStatus: string;
  deliveryStatus: string | null;
  pickupDate: string | null;
  pickupSlotId: string | null;
  scheduledRegion: string | null;
}): DonationStageSource {
  return {
    portal_fulfillment_stage: o.portalFulfillmentStage,
    payment_status: o.paymentStatus,
    pickup_status: o.pickupStatus,
    delivery_status: o.deliveryStatus,
    pickup_date: o.pickupDate,
    pickup_slot_id: o.pickupSlotId,
    scheduled_region: o.scheduledRegion,
  };
}
