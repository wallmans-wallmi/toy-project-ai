import { DEFERRED_PICKUP_SCHEDULING_REGION_ID, getSlotsForRegion } from "@/lib/pickup-regions";

export const PACKING_CHILD_COUNT_MIN = 1;
export const PACKING_CHILD_COUNT_MAX = 4;

export type PackingChildCount = 1 | 2 | 3 | 4;

export type PackingChildNamesTuple = [string, string, string, string];

/** שקיות נוספות לכל ילד או ילדה (מקסימום לכל אחד מהם) */
export type PackingExtraBagsTuple = [number, number, number, number];

export const PACKING_EXTRA_BAGS_MAX_PER_CHILD = 20;

/** מידות משוערות לשקית האריזה הממותגת (לתצוגה בטולטיפ) */
export const PACKING_BAG_DIMENSIONS_TOOLTIP =
  "מידות משוערות: רוחב כ־42 ס״מ, גובה כ־48 ס״מ, עומק בסיס כ־12 ס״מ. השקיות בפועל עשויות להשתנות מעט לפי אצווה";

export const PACKING_CHILD_COUNT_OPTIONS: readonly PackingChildCount[] = [1, 2, 3, 4];

export type PackingKitsFormSlice = {
  childCount: PackingChildCount;
  packingChildNames: PackingChildNamesTuple;
  packingExtraBags: PackingExtraBagsTuple;
};

export function createEmptyPackingChildNames(): PackingChildNamesTuple {
  return ["", "", "", ""];
}

export function createEmptyPackingExtraBags(): PackingExtraBagsTuple {
  return [0, 0, 0, 0];
}

export function clampPackingExtraBagCount(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(PACKING_EXTRA_BAGS_MAX_PER_CHILD, Math.trunc(n)));
}

export function sumPackingExtraBags(childCount: PackingChildCount, bags: PackingExtraBagsTuple): number {
  let s = 0;
  for (let i = 0; i < childCount; i += 1) {
    s += clampPackingExtraBagCount(bags[i] ?? 0);
  }
  return s;
}

export function packingKitsStepValid(slice: PackingKitsFormSlice): boolean {
  const n = slice.childCount;
  if (n < PACKING_CHILD_COUNT_MIN || n > PACKING_CHILD_COUNT_MAX) return false;
  for (let i = 0; i < n; i += 1) {
    if (!slice.packingChildNames[i]?.trim()) return false;
  }
  return true;
}

export function activePackingChildNames(slice: PackingKitsFormSlice): string[] {
  return slice.packingChildNames.slice(0, slice.childCount).map((s) => s.trim());
}

export function joinPackingChildNamesForChildField(slice: PackingKitsFormSlice): string {
  const names = activePackingChildNames(slice).filter(Boolean);
  return names.join(" · ");
}

export function buildPackingKitsPickupNote(slice: PackingKitsFormSlice): string {
  const names = activePackingChildNames(slice);
  if (names.length === 0) return "";
  return `ערכות אריזה (${slice.childCount}): ${names.join(", ")}`;
}

export function defaultDeferredPickupSchedulingFields(): {
  region: string;
  pickupSlotId: string | null;
  pickupDate: string;
} {
  const slotId = getSlotsForRegion(DEFERRED_PICKUP_SCHEDULING_REGION_ID)[0]?.id ?? null;
  return {
    region: DEFERRED_PICKUP_SCHEDULING_REGION_ID,
    pickupSlotId: slotId,
    pickupDate: "",
  };
}
