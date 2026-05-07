import type { AdminDonationPatch } from "@/hooks/useAdminDonations";
import { FUNNEL_ORDERED, FUNNEL_POTENTIAL } from "@/lib/donation-funnel-stage";

/** תוויות סטטוס מחושבות (`adminOrderLifecycleStatusHe`) — סדר תצוגה בדרופדאון אדמין */
export const ADMIN_ORDER_LIFECYCLE_LABELS_HE = [
  "טיוטה",
  "ממתין לתשלום",
  "ממתין לערכה",
  "ערכה התקבלה",
  "תואם איסוף",
  "נאסף",
  /** אחרי מסירה לעמותה לפני סגירת מכתב — תואם ל־`נתרם` בתצוגה כשהמערכת מסווגת כך */
  "ממתין למכתב",
  "מכתב נשלח",
  "מכתב התקבל",
] as const;

export type AdminOrderLifecycleLabelHe = (typeof ADMIN_ORDER_LIFECYCLE_LABELS_HE)[number];

const LIFECYCLE_LABEL_SET = new Set<string>(ADMIN_ORDER_LIFECYCLE_LABELS_HE);

export function isAdminOrderLifecyclePresetLabel(v: string): v is AdminOrderLifecycleLabelHe {
  return LIFECYCLE_LABEL_SET.has(v);
}

/** איפוס תיאום איסוף (כדי שלא יישארו תאריכים שמזיזים את בר הפורטל קדימה) */
const CLEAR_SCHEDULE: Pick<
  AdminDonationPatch,
  "pickup_date" | "pickup_time" | "pickup_slot_id" | "scheduled_region" | "scheduled_slot"
> = {
  pickup_date: null,
  pickup_time: null,
  pickup_slot_id: null,
  scheduled_region: null,
  scheduled_slot: null,
};

/**
 * מצב מלא לפי תווית סטטוס (אדמין בלבד): מאפשר קפיצה קדימה ואחורה בצינור.
 * השדות מכוונים כך ש־`adminOrderLifecycleStatusHe` יחזיר את התווית הנבחרת (או מצב לוגי שקול).
 */
const DONATED_WAITING_LETTER: AdminDonationPatch = {
  funnel_stage: FUNNEL_ORDERED,
  payment_status: "completed",
  portal_fulfillment_stage: "donated",
  pickup_status: "picked_up",
  delivery_status: "delivered",
  letter_status: "pending",
  portal_kit_delivered_sms_at: null,
};

export function adminLifecyclePresetPatch(label: AdminOrderLifecycleLabelHe): AdminDonationPatch {
  const baseEarly: AdminDonationPatch = {
    ...CLEAR_SCHEDULE,
    portal_kit_delivered_sms_at: null,
    pickup_status: "pending",
    delivery_status: "at_warehouse",
    letter_status: "pending",
  };

  switch (label) {
    case "טיוטה":
      return {
        ...baseEarly,
        funnel_stage: FUNNEL_POTENTIAL,
        payment_status: "pending",
        portal_fulfillment_stage: "request_received",
      };
    case "ממתין לתשלום":
      return {
        ...baseEarly,
        funnel_stage: FUNNEL_ORDERED,
        payment_status: "pending",
        portal_fulfillment_stage: "request_received",
      };
    case "ממתין לערכה":
      return {
        ...baseEarly,
        funnel_stage: FUNNEL_ORDERED,
        payment_status: "completed",
        portal_fulfillment_stage: "request_received",
      };
    case "ערכה התקבלה":
      return {
        ...CLEAR_SCHEDULE,
        funnel_stage: FUNNEL_ORDERED,
        payment_status: "completed",
        portal_fulfillment_stage: "kit_delivered",
        pickup_status: "pending",
        delivery_status: "at_warehouse",
        letter_status: "pending",
      };
    case "תואם איסוף":
      return {
        ...CLEAR_SCHEDULE,
        funnel_stage: FUNNEL_ORDERED,
        payment_status: "completed",
        portal_fulfillment_stage: "pickup_scheduled",
        pickup_status: "pending",
        delivery_status: "at_warehouse",
        letter_status: "pending",
        portal_kit_delivered_sms_at: null,
      };
    case "נאסף":
      return {
        ...CLEAR_SCHEDULE,
        funnel_stage: FUNNEL_ORDERED,
        payment_status: "completed",
        portal_fulfillment_stage: "collected",
        pickup_status: "picked_up",
        delivery_status: "sent_to_ngo",
        letter_status: "pending",
        portal_kit_delivered_sms_at: null,
      };
    case "ממתין למכתב":
      return { ...DONATED_WAITING_LETTER };
    case "מכתב נשלח":
      return {
        funnel_stage: FUNNEL_ORDERED,
        payment_status: "completed",
        portal_fulfillment_stage: "donated",
        pickup_status: "picked_up",
        delivery_status: "delivered",
        letter_status: "sent",
        portal_kit_delivered_sms_at: null,
      };
    case "מכתב התקבל":
      return {
        funnel_stage: FUNNEL_ORDERED,
        payment_status: "completed",
        portal_fulfillment_stage: "donated",
        pickup_status: "picked_up",
        delivery_status: "delivered",
        letter_status: "completed",
        portal_kit_delivered_sms_at: null,
      };
  }
}
