export type RegionId = "tel_aviv" | "rishon_lezion" | "pending_coordination";

/** אזור טכני: תיאום איסוף ייעשה אחרי ההרשמה (טופס ללא בחירת חלון) */
export const DEFERRED_PICKUP_SCHEDULING_REGION_ID: RegionId = "pending_coordination";

/** 0 = ראשון … 6 = שבת (כמו ב-Date.getDay()) */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type PickupTimeSlot = {
  id: string;
  /** תווית מלאה לתצוגה, למשל יום ושעות */
  label: string;
  weekday: Weekday;
};

const DEFERRED_PICKUP_SLOT: PickupTimeSlot = {
  id: "pending_coordination_slot",
  label: "יתואם עם הצוות אחרי ההרשמה",
  weekday: 1,
};

function shippingSlotsForRegion(regionId: RegionId): PickupTimeSlot[] {
  return [
    {
      id: `${regionId}_mon_1214`,
      label: "יום שני · 12:00-14:00",
      weekday: 1,
    },
    {
      id: `${regionId}_thu_1214`,
      label: "יום חמישי · 12:00-14:00",
      weekday: 4,
    },
  ];
}

export const PICKUP_REGIONS: {
  id: RegionId;
  label: string;
  slots: PickupTimeSlot[];
}[] = [
  {
    id: "tel_aviv",
    label: "תל אביב יפו והסביבה",
    slots: shippingSlotsForRegion("tel_aviv"),
  },
  {
    id: "rishon_lezion",
    label: "ראשון לציון והסביבה",
    slots: shippingSlotsForRegion("rishon_lezion"),
  },
  {
    id: DEFERRED_PICKUP_SCHEDULING_REGION_ID,
    label: "יתואם עם הצוות אחרי ההרשמה",
    slots: [DEFERRED_PICKUP_SLOT],
  },
];

export function isDeferredPickupSchedulingRegion(regionId: string): boolean {
  return regionId === DEFERRED_PICKUP_SCHEDULING_REGION_ID;
}

export function getRegionById(id: string) {
  return PICKUP_REGIONS.find((r) => r.id === id);
}

export function getSlotsForRegion(regionId: string): PickupTimeSlot[] {
  const region = getRegionById(regionId);
  return region?.slots ?? [];
}

export function getSlotForRegion(regionId: string, slotId: string): PickupTimeSlot | undefined {
  return getSlotsForRegion(regionId).find((s) => s.id === slotId);
}
