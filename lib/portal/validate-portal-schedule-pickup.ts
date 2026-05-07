import { PORTAL_SCHEDULABLE_REGION_IDS } from "@/lib/portal/schedulable-pickup-regions";
import { getRegionById, getSlotsForRegion } from "@/lib/pickup-regions";
import { formatPickupTimeSummaryLine, resolvePickupDateIsoForStandardSlot } from "@/lib/pickup-schedule-slots";

const ALLOWED = new Set<string>(PORTAL_SCHEDULABLE_REGION_IDS);

export type PortalSchedulePickupValidated = {
  region: string;
  pickupSlotId: string;
  pickupDateIso: string;
  scheduledSlotLabel: string;
  pickupWeekday: number;
};

export function validatePortalSchedulePickupBody(body: unknown): { ok: PortalSchedulePickupValidated } | { error: string } {
  if (body === null || typeof body !== "object") {
    return { error: "גוף הבקשה לא תקין" };
  }
  const o = body as Record<string, unknown>;
  const region = typeof o.region === "string" ? o.region.trim() : "";
  const pickupSlotId = typeof o.pickupSlotId === "string" ? o.pickupSlotId.trim() : "";
  if (!ALLOWED.has(region)) {
    return { error: "אזור האיסוף שנבחר אינו זמין לתיאום מהפורטל" };
  }
  if (!pickupSlotId.startsWith(`${region}_`)) {
    return { error: "החלון לא תואם לאזור" };
  }
  const regionMeta = getRegionById(region);
  const slot = getSlotsForRegion(region).find((s) => s.id === pickupSlotId);
  if (!regionMeta || !slot) {
    return { error: "אזור או חלון זמן לא תקינים" };
  }
  if (o.termsAccepted !== true) {
    return { error: "נא לאשר את תנאי השירות" };
  }
  const pickupDateIso = resolvePickupDateIsoForStandardSlot(pickupSlotId, 0);
  if (!pickupDateIso) {
    return { error: "חלון הזמן שנבחר לא נתמך" };
  }
  const scheduledSlotLabel = formatPickupTimeSummaryLine(pickupDateIso, pickupSlotId, slot.label);
  if (!scheduledSlotLabel.trim()) {
    return { error: "לא ניתן לחשב את סיכום מועד האיסוף" };
  }
  return {
    ok: {
      region,
      pickupSlotId,
      pickupDateIso,
      scheduledSlotLabel,
      pickupWeekday: slot.weekday,
    },
  };
}
