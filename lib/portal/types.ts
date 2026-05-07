/** שורת פרופיל בטבלת customer_profiles */
export type CustomerProfileRow = {
  user_id: string;
  phone: string;
  first_name: string;
  last_name: string;
  email: string;
  street_name: string;
  house_number: string;
  apartment_number: string;
  floor: string;
  door_code: string;
  address_notes: string;
  pickup_city: string;
  notify_sms?: boolean;
  notify_email?: boolean;
  ui_locale?: string;
  created_at: string;
  updated_at: string;
};

/** מודל לקוח לפורטל (עותק עריכה בצד לקוח) */
export type PortalCustomerProfile = {
  userId: string;
  phone: string;
  firstName: string;
  lastName: string;
  email: string;
  streetName: string;
  houseNumber: string;
  apartmentNumber: string;
  floor: string;
  doorCode: string;
  addressNotes: string;
  pickupCity: string;
  notifySms: boolean;
  notifyEmail: boolean;
  uiLocale: "he" | "en";
};

export type PortalDonationPaymentStatus = "pending" | "completed";

export type PortalDonationPickupStatus = "pending" | "picked_up" | "failed";

export type PortalDonationLetterStatus = "pending" | "completed" | "failed";

/** הזמנה / בקשה כפי שמוצגת בפורטל */
export type PortalDonationOrder = {
  id: string;
  orderNumber: number | null;
  createdAt: string;
  paymentStatus: PortalDonationPaymentStatus | string;
  pickupStatus: PortalDonationPickupStatus | string;
  letterStatus: PortalDonationLetterStatus | string;
  scheduledRegion: string | null;
  scheduledSlot: string | null;
  pickupCity: string | null;
  toyItemCount: number;
  pickupDate: string | null;
  pickupSlotId: string | null;
  childName: string | null;
  journeyType: string | null;
  amountPaid: number;
  portalFulfillmentStage: string | null;
  portalKitDeliveredSmsAt: string | null;
  deliveryStatus: string | null;
  /** קישור לקבלה/חשבונית (מסטרייפ), null עד לאחר תשלום */
  invoiceUrl: string | null;
};

/** שורה כפי שחוזרת מ־select של הזמנות בפורטל */
export type PortalOrderSelectRow = {
  id: string;
  order_number: number | null;
  created_at: string;
  payment_status: string;
  pickup_status: string;
  letter_status: string;
  scheduled_region: string | null;
  scheduled_slot: string | null;
  pickup_city: string | null;
  toy_items?: unknown;
  pickup_date: string | null;
  pickup_slot_id: string | null;
  child_name: string | null;
  journey_type: string | null;
  amount_paid: number | null;
  portal_fulfillment_stage: string | null;
  portal_kit_delivered_sms_at: string | null;
  delivery_status: string | null;
  invoice_url?: string | null;
};

function uiLocaleFromRow(v: string | undefined): "he" | "en" {
  return v === "en" ? "en" : "he";
}

export function profileRowToPortal(row: CustomerProfileRow): PortalCustomerProfile {
  return {
    userId: row.user_id,
    phone: row.phone,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    streetName: row.street_name,
    houseNumber: row.house_number,
    apartmentNumber: row.apartment_number,
    floor: row.floor,
    doorCode: row.door_code,
    addressNotes: row.address_notes,
    pickupCity: row.pickup_city,
    notifySms: row.notify_sms !== false,
    notifyEmail: row.notify_email !== false,
    uiLocale: uiLocaleFromRow(row.ui_locale),
  };
}

export type CustomerProfileUpdatePayload = Partial<
  Pick<
    CustomerProfileRow,
    | "first_name"
    | "last_name"
    | "email"
    | "street_name"
    | "house_number"
    | "apartment_number"
    | "floor"
    | "door_code"
    | "address_notes"
    | "pickup_city"
    | "notify_sms"
    | "notify_email"
    | "ui_locale"
  >
>;

export function portalProfileToRowPatch(p: Partial<PortalCustomerProfile>): CustomerProfileUpdatePayload {
  const out: CustomerProfileUpdatePayload = {};
  if (p.firstName !== undefined) out.first_name = p.firstName;
  if (p.lastName !== undefined) out.last_name = p.lastName;
  if (p.email !== undefined) out.email = p.email;
  if (p.streetName !== undefined) out.street_name = p.streetName;
  if (p.houseNumber !== undefined) out.house_number = p.houseNumber;
  if (p.apartmentNumber !== undefined) out.apartment_number = p.apartmentNumber;
  if (p.floor !== undefined) out.floor = p.floor;
  if (p.doorCode !== undefined) out.door_code = p.doorCode;
  if (p.addressNotes !== undefined) out.address_notes = p.addressNotes;
  if (p.pickupCity !== undefined) out.pickup_city = p.pickupCity;
  if (p.notifySms !== undefined) out.notify_sms = p.notifySms;
  if (p.notifyEmail !== undefined) out.notify_email = p.notifyEmail;
  if (p.uiLocale !== undefined) out.ui_locale = p.uiLocale;
  return out;
}

export type DonationSelectRow = {
  id: string;
  created_at: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  email: string | null;
  address: string;
  street_name: string | null;
  house_number: string | null;
  apartment_number: string | null;
  floor: string | null;
  door_code: string | null;
  address_notes: string | null;
  pickup_city: string | null;
  payment_status: string;
  pickup_status: string;
  letter_status: string;
  scheduled_region: string | null;
  scheduled_slot: string | null;
  child_name: string | null;
  journey_type: string | null;
  amount_paid: number | null;
};

function toyItemCountFromRow(raw: unknown): number {
  if (Array.isArray(raw)) return raw.length;
  return 0;
}

export function donationRowToPortalOrder(row: PortalOrderSelectRow): PortalDonationOrder {
  const paid = typeof row.amount_paid === "number" && Number.isFinite(row.amount_paid) ? row.amount_paid : 0;
  const orderNum =
    typeof row.order_number === "number" && Number.isFinite(row.order_number) ? Math.trunc(row.order_number) : null;
  return {
    id: row.id,
    orderNumber: orderNum,
    createdAt: row.created_at,
    paymentStatus: row.payment_status,
    pickupStatus: row.pickup_status,
    letterStatus: row.letter_status,
    scheduledRegion: row.scheduled_region,
    scheduledSlot: row.scheduled_slot,
    pickupCity: row.pickup_city,
    toyItemCount: toyItemCountFromRow(row.toy_items),
    pickupDate: row.pickup_date,
    pickupSlotId: row.pickup_slot_id,
    childName: row.child_name,
    journeyType: row.journey_type,
    amountPaid: paid,
    portalFulfillmentStage: row.portal_fulfillment_stage,
    portalKitDeliveredSmsAt: row.portal_kit_delivered_sms_at,
    deliveryStatus: row.delivery_status,
    invoiceUrl: row.invoice_url != null && String(row.invoice_url).trim() ? String(row.invoice_url).trim() : null,
  };
}
