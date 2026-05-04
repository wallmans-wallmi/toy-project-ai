export type RegionId = "tel_aviv" | "rishon_lezion";

/** 0 = ראשון … 6 = שבת (כמו ב-Date.getDay()) */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type PickupTimeSlot = {
  id: string;
  /** תווית מלאה לתצוגה, למשל יום ושעות */
  label: string;
  weekday: Weekday;
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
];

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
