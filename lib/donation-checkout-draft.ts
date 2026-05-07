import { pickupCheckoutTotalIls } from "@/lib/constants/pricing";
import {
  buildCheckoutToyItemsJson,
  buildSyntheticToyPayloadFromPackingForPickup,
  mergePackingExtraBagsIntoToyPayloads,
  sumExtraBagsFromToyPayloads,
  type CheckoutItemsFormInput,
  type DonationToyItemJson,
  type DonationToyItemToy,
} from "@/lib/donation-checkout-items";
import { FUNNEL_POTENTIAL } from "@/lib/donation-funnel-stage";
import { isDonationJourneyId, type DonationJourneyId } from "@/lib/donation-journey";
import { joinPackingChildNamesForChildField } from "@/lib/donation-packing-kits";
import { formatPickupTimeSummaryLine } from "@/lib/pickup-schedule-slots";
import { getRegionById, getSlotForRegion } from "@/lib/pickup-regions";
import type { DonationFormState } from "@/hooks/use-donation-form";

export type DonationDraftRequestBody = {
  donationId?: string;
  form: DonationFormState;
  pickupSimplified?: boolean;
};

function textOrNull(s: string): string | null {
  const t = s.trim();
  return t.length > 0 ? t : null;
}

function childNameForDraft(form: DonationFormState, pickupSimplified: boolean): string {
  if (pickupSimplified) return joinPackingChildNamesForChildField(form).trim() || form.childName.trim();
  const fromItem = form.toyItems.find((t) => t.itemChildName.trim())?.itemChildName.trim();
  return (fromItem || form.childName).trim();
}

function packingNote(form: DonationFormState): string {
  const n = form.childCount;
  const names = form.packingChildNames.slice(0, n).map((x) => x.trim());
  if (names.length !== n || names.some((s) => !s)) return "";
  return `ערכות אריזה (${n}): ${names.join(", ")}`;
}

export function validateDonationDraftBody(body: unknown): { ok: DonationDraftRequestBody } | { error: string } {
  if (!body || typeof body !== "object") return { error: "גוף הבקשה לא תקין" };
  const o = body as Record<string, unknown>;
  const form = o.form as DonationFormState | undefined;
  if (!form || typeof form !== "object") return { error: "חסר מצב טופס" };
  const pickupSimplified = o.pickupSimplified === true;
  const donationId = typeof o.donationId === "string" && o.donationId.trim() ? o.donationId.trim() : undefined;

  if (!isDonationJourneyId(form.journeyType)) return { error: "מסלול לא נתמך" };
  const first = form.firstName.trim();
  const last = form.lastName.trim();
  const phone = form.phone.trim();
  const email = form.email.trim();
  const addr = form.streetName.trim() && form.houseNumber.trim()
    ? `${form.streetName.trim()} ${form.houseNumber.trim()}`.trim()
    : "";
  if (!first || !last || !phone || !email) return { error: "חסרים שם, טלפון או מייל" };
  if (!addr) return { error: "חסרה כתובת (רחוב ומספר בית)" };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "מייל לא תקין" };

  if (pickupSimplified) {
    const line = packingNote(form);
    if (!line) return { error: "נא למלא שם לכל ילד או ילדה בערכת האריזה" };
    const region = form.region.trim();
    const slotId = form.pickupSlotId?.trim() ?? "";
    if (!region || !getRegionById(region) || !getSlotForRegion(region, slotId)) return { error: "אזור או חלון זמן חסרים" };
  }

  return { ok: { donationId, form, pickupSimplified } };
}

export function buildDonationDraftRow(form: DonationFormState, pickupSimplified: boolean): Record<string, unknown> {
  const first = form.firstName.trim();
  const last = form.lastName.trim();
  const phone = form.phone.trim();
  const email = form.email.trim();
  const journeyType = form.journeyType as DonationJourneyId;
  const itemsInput: CheckoutItemsFormInput = {
    journeyType,
    childName: form.childName,
    toyItems: form.toyItems,
  };
  let toyItems: unknown[] = buildCheckoutToyItemsJson(itemsInput);
  if (toyItems.length === 0 && pickupSimplified) {
    toyItems = buildSyntheticToyPayloadFromPackingForPickup(form);
  } else if (toyItems.length > 0) {
    toyItems = mergePackingExtraBagsIntoToyPayloads(toyItems as DonationToyItemToy[], form);
  }

  const childName = childNameForDraft(form, pickupSimplified);
  const packingLine = packingNote(form);
  const pickupNotesMerged = [packingLine, form.addressNotes.trim()].filter(Boolean).join("\n\n");

  const region = form.region.trim();
  const slotId = form.pickupSlotId?.trim() ?? "";
  const slot = region && slotId ? getSlotForRegion(region, slotId) : undefined;
  const pickupDateRaw = form.pickupDate.trim();
  const pickupDateOk = pickupDateRaw ? /^\d{4}-\d{2}-\d{2}$/.test(pickupDateRaw) : false;
  const scheduledSlotLabel =
    slot && pickupDateOk && pickupDateRaw
      ? formatPickupTimeSummaryLine(pickupDateRaw, slotId, slot.label)
      : slot?.label ?? "";

  const pickupCity = form.pickupCity.trim() || null;
  const addrLine = [
    form.streetName.trim(),
    form.houseNumber.trim(),
    form.apartmentNumber.trim() ? `דירה ${form.apartmentNumber.trim()}` : "",
    form.floor.trim() ? `קומה ${form.floor.trim()}` : "",
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  const extraSum = sumExtraBagsFromToyPayloads(toyItems as DonationToyItemJson[]);

  return {
    funnel_stage: FUNNEL_POTENTIAL,
    first_name: first,
    last_name: last,
    child_name: childName || first,
    phone,
    email,
    address: addrLine,
    pickup_address: addrLine,
    street_name: textOrNull(form.streetName),
    house_number: textOrNull(form.houseNumber),
    apartment_number: textOrNull(form.apartmentNumber),
    floor: textOrNull(form.floor),
    door_code: textOrNull(form.doorCode),
    address_notes: textOrNull(form.addressNotes),
    pickup_notes: textOrNull(pickupNotesMerged),
    scheduled_region: region || null,
    pickup_slot_id: slot?.id ?? null,
    pickup_weekday: slot?.weekday ?? null,
    scheduled_slot: scheduledSlotLabel || null,
    pickup_date: pickupDateOk ? pickupDateRaw : null,
    pickup_city: pickupCity,
    journey_type: journeyType,
    toy_items: toyItems,
    toy_description: null,
    toys_quality_confirmed: false,
    terms_accepted: false,
    payment_status: "pending",
    portal_fulfillment_stage: "request_received",
    amount_paid: pickupCheckoutTotalIls(extraSum),
    letter_status: "pending",
    ai_generated_letter: null,
    destination_name: null,
  };
}
