import type { RegionId } from "@/lib/pickup-regions";

/** אזורים שבהם ניתן לבחור חלון איסוף אמיתי בפורטל (ללא תיאום דחוי) */
export const PORTAL_SCHEDULABLE_REGION_IDS = ["tel_aviv", "rishon_lezion"] as const satisfies readonly RegionId[];
