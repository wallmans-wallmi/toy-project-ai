import type { PickupTimeSlot } from "@/lib/pickup-regions";
import { getRegionById, getSlotForRegion } from "@/lib/pickup-regions";
import { formatPickupTimeSummaryLine } from "@/lib/pickup-schedule-slots";
import {
  formatCheckoutToyItemsDescription,
  parseToyItemsPayload,
  sumExtraBagsFromToyPayloads,
  type DonationToyItemJson,
} from "@/lib/donation-checkout-items";
import { pickupCheckoutTotalIls } from "@/lib/constants/pricing";
import { FUNNEL_ORDERED } from "@/lib/donation-funnel-stage";
import { isDonationJourneyId, type DonationJourneyId } from "@/lib/donation-journey";

export const DONATION_PAYMENT_STATUS_PENDING = "pending" as const;
export const DONATION_PAYMENT_STATUS_COMPLETED = "completed" as const;

const UPGRADE_DONATION_UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type DonationPaymentLifecycleStatus =
  | typeof DONATION_PAYMENT_STATUS_PENDING
  | typeof DONATION_PAYMENT_STATUS_COMPLETED;

export type DonationCheckoutRequestBody = {
  firstName?: string;
  lastName?: string;
  childName?: string;
  journeyType?: string;
  phone?: string;
  /** מזהה ייחודי לחשבון (כרגע זהה למספר הטלפון) — הכנה לאימות OTP */
  accountPhoneKey?: string;
  email?: string;
  address?: string;
  doorCode?: string;
  region?: string;
  pickupCity?: string;
  toyItems?: unknown;
  toysQualityConfirmed?: boolean;
  termsAccepted?: boolean;
  pickupSlotId?: string | null;
  pickupDate?: string;
  /** הערות לקוח לכתובת (קוד שער וכו׳) */
  addressNotes?: string;
  /** @deprecated השתמשו ב־addressNotes */
  pickupNotes?: string;
  streetName?: string;
  houseNumber?: string;
  apartmentNumber?: string;
  floor?: string;
  packingChildCount?: number;
  packingChildNames?: unknown;
  /** אם נשלח, משדרגים שורת טיוטה (potential) ל־ordered במקום insert חדש */
  upgradeDonationId?: string;
};

export type DonationCheckoutLeadValidated = {
  firstName: string;
  lastName: string;
  childName: string;
  phone: string;
  email: string;
  /** שורת כתובת מורכבת (רחוב+בית+דירה+קומה) כפי שנשלחה מהטופס */
  address: string;
  doorCode: string;
  streetName: string;
  houseNumber: string;
  apartmentNumber: string;
  floor: string;
  /** שורת ערכות אריזה בלבד (ל־pickup_notes) */
  packingKitsNote: string;
  /** הערות לקוח לכתובת (ל־address_notes) */
  customerAddressNotes: string;
  accountPhoneKey: string;
  region: string;
  pickupCity: string | null;
  journeyType: DonationJourneyId;
  toyPayloads: DonationToyItemJson[];
  pickupSlotId: string;
  pickupDateRaw: string;
  scheduledSlotLabel: string;
  slot: PickupTimeSlot;
  upgradeDonationId?: string;
};

export type CheckoutLeadCapturedApiPayload = {
  success: true;
  donation_id: string;
  order_number: number;
  payment_status: typeof DONATION_PAYMENT_STATUS_PENDING;
  lead_captured: true;
  lead: {
    donation_id: string;
    order_number: number;
    journey_type: DonationJourneyId;
    scheduled_region: string;
    toy_items_count: number;
  };
};

export function buildCheckoutLeadCaptureApiPayload(
  donationId: string,
  orderNumber: number,
  validated: DonationCheckoutLeadValidated,
): CheckoutLeadCapturedApiPayload {
  return {
    success: true,
    donation_id: donationId,
    order_number: orderNumber,
    payment_status: DONATION_PAYMENT_STATUS_PENDING,
    lead_captured: true,
    lead: {
      donation_id: donationId,
      order_number: orderNumber,
      journey_type: validated.journeyType,
      scheduled_region: validated.region,
      toy_items_count: validated.toyPayloads.length,
    },
  };
}

function isValidEmailForCheckout(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function childNameFromToyItemsPayload(items: DonationToyItemJson[]): string {
  for (const p of items) {
    if (p.type === "toy" && p.childName.trim()) return p.childName.trim();
  }
  return "";
}

function normalizePackingChildCount(value: unknown): number | undefined {
  if (value === undefined || value === null) return undefined;
  const n = typeof value === "number" ? value : Number.parseInt(String(value), 10);
  if (!Number.isFinite(n) || n < 1 || n > 4) return undefined;
  return n;
}

function tryBuildPackingKitsNote(body: DonationCheckoutRequestBody): string {
  const n = normalizePackingChildCount(body.packingChildCount);
  if (n === undefined) return "";
  if (!Array.isArray(body.packingChildNames)) return "";
  const names = body.packingChildNames.slice(0, n).map((x) => String(x).trim());
  if (names.length !== n || names.some((s) => !s)) return "";
  return `ערכות אריזה (${n}): ${names.join(", ")}`;
}

export function validateDonationCheckoutLead(
  body: DonationCheckoutRequestBody,
): { ok: DonationCheckoutLeadValidated } | { error: string } {
  const journeyTypeRaw = body.journeyType;
  if (!isDonationJourneyId(journeyTypeRaw)) {
    return { error: "מסלול לא נתמך — השירות כולל כיום תרומת צעצועים בלבד" };
  }

  const toyPayloads = parseToyItemsPayload(journeyTypeRaw, body.toyItems);
  if (toyPayloads === null) {
    return { error: "רשימת הפריטים לא תקינה — נא לעדכן ולנסות שוב" };
  }

  if (toyPayloads.length === 0) {
    return { error: "נא למלא לפחות פריט אחד עם כל השדות" };
  }

  if (body.toysQualityConfirmed !== true) {
    return { error: "נא לאשר את מצב הפריטים לפני התשלום" };
  }

  let childName = body.childName?.trim() ?? "";
  if (!childName) {
    childName = childNameFromToyItemsPayload(toyPayloads);
  }
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

  const accountKey = body.accountPhoneKey?.trim();
  if (accountKey && accountKey !== phone) {
    return { error: "מפתח החשבון חייב להתאים למספר הטלפון" };
  }

  const packingLine = tryBuildPackingKitsNote(body);
  if (normalizePackingChildCount(body.packingChildCount) !== undefined && !packingLine) {
    return { error: "נא למלא שם לכל ילד או ילדה בערכת האריזה" };
  }
  const customerAddressNotes = (body.addressNotes ?? body.pickupNotes ?? "").trim();
  const streetName = body.streetName?.trim() ?? "";
  const houseNumber = body.houseNumber?.trim() ?? "";
  const apartmentNumber = body.apartmentNumber?.trim() ?? "";
  const floor = body.floor?.trim() ?? "";

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

  const upgradeRaw = body.upgradeDonationId?.trim();
  let upgradeDonationId: string | undefined;
  if (upgradeRaw) {
    if (!UPGRADE_DONATION_UUID_RE.test(upgradeRaw)) {
      return { error: "מזהה טיוטה לא תקין" };
    }
    upgradeDonationId = upgradeRaw;
  }

  return {
    ok: {
      firstName,
      lastName,
      childName,
      phone,
      accountPhoneKey: phone,
      email,
      address,
      doorCode: body.doorCode?.trim() ?? "",
      streetName,
      houseNumber,
      apartmentNumber,
      floor,
      packingKitsNote: packingLine,
      customerAddressNotes,
      region,
      pickupCity,
      journeyType: journeyTypeRaw,
      toyPayloads,
      pickupSlotId,
      pickupDateRaw,
      scheduledSlotLabel,
      slot,
      upgradeDonationId,
    },
  };
}

function textOrNull(s: string): string | null {
  const t = s.trim();
  return t.length > 0 ? t : null;
}

export function buildDonationAbandonedCartLeadRow(v: DonationCheckoutLeadValidated): Record<string, unknown> {
  const toyDescription = formatCheckoutToyItemsDescription(v.toyPayloads);
  const pickupDateIso = /^\d{4}-\d{2}-\d{2}$/.test(v.pickupDateRaw.trim()) ? v.pickupDateRaw.trim() : null;
  return {
    funnel_stage: FUNNEL_ORDERED,
    first_name: v.firstName,
    last_name: v.lastName,
    child_name: v.childName,
    phone: v.phone,
    email: v.email,
    address: v.address,
    pickup_address: v.address.trim(),
    street_name: textOrNull(v.streetName),
    house_number: textOrNull(v.houseNumber),
    apartment_number: textOrNull(v.apartmentNumber),
    floor: textOrNull(v.floor),
    door_code: v.doorCode || null,
    address_notes: textOrNull(v.customerAddressNotes),
    toy_description: toyDescription || null,
    toy_items: v.toyPayloads,
    toys_quality_confirmed: true,
    terms_accepted: true,
    pickup_weekday: v.slot.weekday,
    pickup_slot_id: v.slot.id,
    scheduled_slot: v.scheduledSlotLabel,
    pickup_date: pickupDateIso,
    pickup_notes: textOrNull(v.packingKitsNote),
    scheduled_region: v.region,
    pickup_city: v.pickupCity,
    journey_type: v.journeyType,
    payment_status: DONATION_PAYMENT_STATUS_PENDING,
    portal_fulfillment_stage: "request_received",
    amount_paid: pickupCheckoutTotalIls(sumExtraBagsFromToyPayloads(v.toyPayloads)),
    letter_status: "pending",
    ai_generated_letter: null,
    destination_name: null,
  };
}
