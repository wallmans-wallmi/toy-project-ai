import type { PickupTimeSlot } from "@/lib/pickup-regions";
import { getRegionById, getSlotForRegion } from "@/lib/pickup-regions";
import { formatPickupTimeSummaryLine } from "@/lib/pickup-schedule-slots";
import {
  formatToyDescriptionFromPayloads,
  parseToyItemsPayload,
  type ToyItemPayload,
} from "@/lib/toy-donation";

/** מזהי מסלול תרומה או גמילה לשדה journey_type במסד */
export const DONATION_JOURNEY_IDS = [
  "toy_dropoff",
  "pacifier_weaning",
  "diaper_weaning",
  "bottle_weaning",
] as const;

export type DonationJourneyId = (typeof DONATION_JOURNEY_IDS)[number];

/** מסלולי גמילה — פלט AI הוא תעודת "בוגר/ת", לא מכתב צעצועים */
export const WEANING_JOURNEY_IDS = [
  "pacifier_weaning",
  "diaper_weaning",
  "bottle_weaning",
] as const;

export type WeaningJourneyId = (typeof WEANING_JOURNEY_IDS)[number];

export function isToyDropoffJourney(value: unknown): value is "toy_dropoff" {
  return value === "toy_dropoff";
}

export function isWeaningJourneyId(value: unknown): value is WeaningJourneyId {
  return typeof value === "string" && WEANING_JOURNEY_IDS.includes(value as WeaningJourneyId);
}

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

// ─── Abandoned cart / lead capture (API checkout) — לוגיקה מרוכזת כאן לפי ארכיטקטורה ───

/** ערכים חוקיים לעמודת payment_status ב־Supabase */
export const DONATION_PAYMENT_STATUS_PENDING = "pending" as const;
export const DONATION_PAYMENT_STATUS_COMPLETED = "completed" as const;

export type DonationPaymentLifecycleStatus =
  | typeof DONATION_PAYMENT_STATUS_PENDING
  | typeof DONATION_PAYMENT_STATUS_COMPLETED;

export type DonationCheckoutRequestBody = {
  firstName?: string;
  lastName?: string;
  childName?: string;
  journeyType?: string;
  phone?: string;
  email?: string;
  address?: string;
  doorCode?: string;
  region?: string;
  /** עיר מטופס האיסוף — נתוני שיווק / שימור */
  pickupCity?: string;
  toyItems?: unknown;
  toysQualityConfirmed?: boolean;
  termsAccepted?: boolean;
  pickupSlotId?: string | null;
  pickupDate?: string;
  pickupNotes?: string;
};

export type DonationCheckoutLeadValidated = {
  firstName: string;
  lastName: string;
  childName: string;
  phone: string;
  email: string;
  address: string;
  doorCode: string;
  pickupNotes: string;
  region: string;
  pickupCity: string | null;
  journeyType: DonationJourneyId;
  toyPayloads: ToyItemPayload[];
  pickupSlotId: string;
  pickupDateRaw: string;
  scheduledSlotLabel: string;
  slot: PickupTimeSlot;
};

/** תגובת API ל־/api/checkout לאחר לכידת ליד — ל־Mixpanel / Meta Pixel וכו׳ */
export type CheckoutLeadCapturedApiPayload = {
  success: true;
  donation_id: string;
  payment_status: typeof DONATION_PAYMENT_STATUS_PENDING;
  lead_captured: true;
  lead: {
    donation_id: string;
    journey_type: DonationJourneyId;
    scheduled_region: string;
    toy_items_count: number;
  };
};

export function buildCheckoutLeadCaptureApiPayload(
  donationId: string,
  validated: DonationCheckoutLeadValidated,
): CheckoutLeadCapturedApiPayload {
  return {
    success: true,
    donation_id: donationId,
    payment_status: DONATION_PAYMENT_STATUS_PENDING,
    lead_captured: true,
    lead: {
      donation_id: donationId,
      journey_type: validated.journeyType,
      scheduled_region: validated.region,
      toy_items_count: validated.toyPayloads.length,
    },
  };
}

function isValidEmailForCheckout(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/**
 * אימות מלא של גוף הבקשה ל־checkout — לפני כל כתיבה ל־Supabase (ליד / עגלה נטושה).
 */
export function validateDonationCheckoutLead(
  body: DonationCheckoutRequestBody,
): { ok: DonationCheckoutLeadValidated } | { error: string } {
  const journeyTypeRaw = body.journeyType;
  if (!isDonationJourneyId(journeyTypeRaw)) {
    return { error: "נא לבחור את המשימה שלכם לפני התשלום" };
  }

  const toyPayloads = parseToyItemsPayload(body.toyItems);
  if (toyPayloads === null) {
    return { error: "רשימת הפריטים לא תקינה — נא לעדכן ולנסות שוב" };
  }

  if (isToyDropoffJourney(journeyTypeRaw) && toyPayloads.length === 0) {
    return { error: "נא למלא לפחות פריט אחד עם כל השדות" };
  }

  if (body.toysQualityConfirmed !== true) {
    return { error: "נא לאשר את מצב הפריטים לפני התשלום" };
  }

  const childName = body.childName?.trim() ?? "";
  if (!childName) {
    return { error: "נא למלא את שם הילד או הילדה" };
  }

  if (body.termsAccepted !== true) {
    return { error: "נא לאשר את תנאי השירות לפני התשלום" };
  }

  const firstName = body.firstName?.trim();
  const lastName = body.lastName?.trim();
  const phone = body.phone?.trim();
  const email = body.email?.trim() ?? "";
  const address = body.address?.trim();
  const region = body.region?.trim();

  if (!firstName || !lastName || !phone || !address || !region) {
    return { error: "חסרים שדות חובה" };
  }

  if (!isValidEmailForCheckout(email)) {
    return { error: "נא למלא אימייל תקין" };
  }

  const pickupSlotId = body.pickupSlotId?.trim() ?? "";
  const regionMeta = getRegionById(region);
  const slot = pickupSlotId ? getSlotForRegion(region, pickupSlotId) : undefined;
  if (!regionMeta || !slot) {
    return { error: "אזור או חלון זמן לא תקינים" };
  }

  const pickupDateRaw = body.pickupDate?.trim() ?? "";
  const pickupDateOk = pickupDateRaw ? /^\d{4}-\d{2}-\d{2}$/.test(pickupDateRaw) : false;
  const scheduledSlotLabel =
    pickupDateOk && pickupDateRaw
      ? formatPickupTimeSummaryLine(pickupDateRaw, pickupSlotId, slot.label)
      : slot.label;

  const pickupCityRaw = body.pickupCity?.trim() ?? "";
  const pickupCity = pickupCityRaw.length > 0 ? pickupCityRaw : null;

  return {
    ok: {
      firstName,
      lastName,
      childName,
      phone,
      email,
      address,
      doorCode: body.doorCode?.trim() ?? "",
      pickupNotes: body.pickupNotes?.trim() ?? "",
      region,
      pickupCity,
      journeyType: journeyTypeRaw,
      toyPayloads,
      pickupSlotId,
      pickupDateRaw,
      scheduledSlotLabel,
      slot,
    },
  };
}

/** שורת insert ל־donations — ליד מיד לאחר אימות (עגלה נטושה, לפני תשלום) */
export function buildDonationAbandonedCartLeadRow(v: DonationCheckoutLeadValidated): Record<string, unknown> {
  const toyDescription = formatToyDescriptionFromPayloads(v.toyPayloads);
  return {
    first_name: v.firstName,
    last_name: v.lastName,
    child_name: v.childName,
    phone: v.phone,
    email: v.email,
    address: v.address,
    door_code: v.doorCode || null,
    toy_description: toyDescription || null,
    toy_items: v.toyPayloads,
    toys_quality_confirmed: true,
    terms_accepted: true,
    pickup_weekday: v.slot.weekday,
    pickup_slot_id: v.slot.id,
    scheduled_slot: v.scheduledSlotLabel,
    pickup_notes: v.pickupNotes || null,
    scheduled_region: v.region,
    pickup_city: v.pickupCity,
    journey_type: v.journeyType,
    payment_status: DONATION_PAYMENT_STATUS_PENDING,
    amount_paid: 0,
    letter_status: "pending",
    ai_generated_letter: null,
    destination_name: null,
  };
}
