/** מזהי מסלול תרומה או גמילה לשדה journey_type במסד */
export const DONATION_JOURNEY_IDS = [
  "toy_dropoff",
  "pacifier_weaning",
  "diaper_weaning",
  "bottle_weaning",
] as const;

export type DonationJourneyId = (typeof DONATION_JOURNEY_IDS)[number];

/** אימוג'י אחיד לכרטיסי מסלול בדף הבית, בטופס וב«פרס מותאם» */
export const DONATION_JOURNEY_EMOJI: Record<DonationJourneyId, string> = {
  toy_dropoff: "🧸",
  pacifier_weaning: "🍬",
  diaper_weaning: "🩲",
  bottle_weaning: "🍼",
};

export const DONATION_JOURNEY_OPTIONS: readonly { id: DonationJourneyId; label: string }[] = [
  { id: "toy_dropoff", label: "מסירת צעצועים (מפנים מקום בבית)" },
  { id: "pacifier_weaning", label: "נפרדים מהמוצץ (גמילה מהמוצץ)" },
  { id: "diaper_weaning", label: "נפרדים מהחיתול (גמילה מחיתולים)" },
  { id: "bottle_weaning", label: "נפרדים מהבקבוק (גמילה מבקבוק או פורמולה)" },
];

export function isDonationJourneyId(value: unknown): value is DonationJourneyId {
  return typeof value === "string" && DONATION_JOURNEY_IDS.includes(value as DonationJourneyId);
}

export function getDonationJourneyLabel(id: string): string {
  const found = DONATION_JOURNEY_OPTIONS.find((o) => o.id === id);
  return found?.label ?? "";
}

/** פלייסהולדר לשם הפריט לפי המסלול */
export function journeyItemNamePlaceholder(journeyType: string): string {
  switch (journeyType) {
    case "toy_dropoff":
      return "למשל משחק הרכבה או בובת רך";
    case "pacifier_weaning":
      return "למשל מוצץ סיליקון לגילאי 6 חודשים";
    case "diaper_weaning":
      return "למשל חבילת חיתולים מידה 4 או תחתוני אימון";
    case "bottle_weaning":
      return "למשל בקבוק האכלה 240 מל או מארז פורמולה";
    default:
      return "למשל תיאור קצר של הפריט";
  }
}

/** טקסט עזר תחת כותרת השלב לפי המסלול */
export function journeyItemsStepHint(journeyType: string): string | null {
  switch (journeyType) {
    case "toy_dropoff":
      return "ניתן לפרט צעצועים במצב טוב שמתאימים להמשך שימוש";
    case "pacifier_weaning":
      return "ניתן לפרט מוצצים או ערכות גמילה הרלוונטיות לכם";
    case "diaper_weaning":
      return "ניתן לפרט חיתולים תחתוני אימון או ציוד קשור לגמילה";
    case "bottle_weaning":
      return "ניתן לפרט בקבוקים ערכות האכלה או פורמולה פתוחה בתוקף";
    default:
      return null;
  }
}
