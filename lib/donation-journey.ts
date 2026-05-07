/** מזהי מסלול פעיל — תרומת צעצועים בלבד */
export const DONATION_JOURNEY_IDS = ["toy_dropoff"] as const;

export type DonationJourneyId = (typeof DONATION_JOURNEY_IDS)[number];

/** מזהי מסלול ישנים במסד — תצוגה ומכתבים לשורות קיימות */
export const LEGACY_WEANING_JOURNEY_IDS = ["pacifier_weaning", "diaper_weaning", "bottle_weaning"] as const;

export type LegacyWeaningJourneyId = (typeof LEGACY_WEANING_JOURNEY_IDS)[number];

export function isToyDropoffJourney(value: unknown): value is "toy_dropoff" {
  return value === "toy_dropoff";
}

export function isLegacyWeaningJourneyId(value: unknown): value is LegacyWeaningJourneyId {
  return typeof value === "string" && LEGACY_WEANING_JOURNEY_IDS.includes(value as LegacyWeaningJourneyId);
}

/** @deprecated השתמשו ב־isLegacyWeaningJourneyId */
export const WEANING_JOURNEY_IDS = LEGACY_WEANING_JOURNEY_IDS;
export type WeaningJourneyId = LegacyWeaningJourneyId;

export function isWeaningJourneyId(value: unknown): value is LegacyWeaningJourneyId {
  return isLegacyWeaningJourneyId(value);
}

export function isDonationJourneyId(value: unknown): value is DonationJourneyId {
  return value === "toy_dropoff";
}

const LEGACY_JOURNEY_LABELS: Record<string, string> = {
  pacifier_weaning: "גמילה מהמוצץ (ארכיון)",
  diaper_weaning: "גמילה מחיתולים (ארכיון)",
  bottle_weaning: "גמילה מבקבוק (ארכיון)",
};

export const DONATION_JOURNEY_EMOJI: Record<DonationJourneyId, string> = {
  toy_dropoff: "🧸",
};

export const DONATION_JOURNEY_OPTIONS: readonly { id: DonationJourneyId; label: string }[] = [
  { id: "toy_dropoff", label: "מסירת צעצועים (מפנים מקום בבית)" },
];

export function getDonationJourneyLabel(id: string): string {
  const active = DONATION_JOURNEY_OPTIONS.find((o) => o.id === id);
  if (active) return active.label;
  return LEGACY_JOURNEY_LABELS[id] ?? "";
}

export function journeyItemNamePlaceholder(_journeyType: string): string {
  return "למשל משחק הרכבה או בובת רך";
}

export function journeyItemsStepHint(_journeyType: string): string | null {
  return "ניתן לפרט צעצועים במצב טוב שמתאימים להמשך שימוש";
}
