import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { ADMIN_SESSION_COOKIE, getAdminSessionFromCookie, verifyAdminSessionCookie } from "@/lib/admin-auth";
import { donationPatchForbiddenMessage } from "@/lib/admin-donation-patch-rbac";
import type { AdminDashboardRole } from "@/lib/admin-role-types";
import { isPortalFulfillmentStage } from "@/lib/portal/fulfillment-stages";
import { createServiceRoleClient } from "@/lib/supabase/service";

export const runtime = "nodejs";

const PAYMENT = ["pending", "completed", "cancelled"] as const;
const LETTER = ["pending", "completed", "failed", "generated", "sent"] as const;
const PICKUP_STATUS = ["pending", "picked_up", "failed"] as const;
const DELIVERY_STATUS = ["at_warehouse", "sent_to_ngo", "delivered"] as const;

const FUNNEL = ["potential", "ordered"] as const;

const bodySchema = z
  .object({
    id: z.string().uuid(),
    funnel_stage: z.enum(FUNNEL).optional(),
    payment_status: z.enum(PAYMENT).optional(),
    letter_status: z.enum(LETTER).optional(),
    pickup_date: z.union([z.string(), z.null()]).optional(),
    pickup_time: z.union([z.string(), z.null()]).optional(),
    pickup_slot_id: z.union([z.string(), z.null()]).optional(),
    scheduled_region: z.union([z.string(), z.null()]).optional(),
    scheduled_slot: z.union([z.string(), z.null()]).optional(),
    pickup_address: z.union([z.string(), z.null()]).optional(),
    pickup_status: z.enum(PICKUP_STATUS).optional(),
    delivery_status: z.enum(DELIVERY_STATUS).optional(),
    target_ngo_name: z.union([z.string(), z.null()]).optional(),
    target_ngo_city: z.union([z.string(), z.null()]).optional(),
    delivery_time: z.union([z.string(), z.null()]).optional(),
    first_name: z.union([z.string(), z.null()]).optional(),
    last_name: z.union([z.string(), z.null()]).optional(),
    phone: z.union([z.string(), z.null()]).optional(),
    email: z.union([z.string(), z.null()]).optional(),
    address: z.union([z.string(), z.null()]).optional(),
    street_name: z.union([z.string(), z.null()]).optional(),
    house_number: z.union([z.string(), z.null()]).optional(),
    apartment_number: z.union([z.string(), z.null()]).optional(),
    floor: z.union([z.string(), z.null()]).optional(),
    child_name: z.union([z.string(), z.null()]).optional(),
    pickup_notes: z.union([z.string(), z.null()]).optional(),
    address_notes: z.union([z.string(), z.null()]).optional(),
    door_code: z.union([z.string(), z.null()]).optional(),
    portal_fulfillment_stage: z.string().optional(),
    portal_kit_delivered_sms_at: z.union([z.string(), z.null()]).optional(),
  })
  .refine(
    (b) =>
      b.funnel_stage !== undefined ||
      b.payment_status !== undefined ||
      b.letter_status !== undefined ||
      b.pickup_date !== undefined ||
      b.pickup_time !== undefined ||
      b.pickup_slot_id !== undefined ||
      b.scheduled_region !== undefined ||
      b.scheduled_slot !== undefined ||
      b.pickup_address !== undefined ||
      b.pickup_status !== undefined ||
      b.delivery_status !== undefined ||
      b.target_ngo_name !== undefined ||
      b.target_ngo_city !== undefined ||
      b.delivery_time !== undefined ||
      b.first_name !== undefined ||
      b.last_name !== undefined ||
      b.phone !== undefined ||
      b.email !== undefined ||
      b.address !== undefined ||
      b.street_name !== undefined ||
      b.house_number !== undefined ||
      b.apartment_number !== undefined ||
      b.floor !== undefined ||
      b.child_name !== undefined ||
      b.pickup_notes !== undefined ||
      b.address_notes !== undefined ||
      b.door_code !== undefined ||
      b.portal_fulfillment_stage !== undefined ||
      b.portal_kit_delivered_sms_at !== undefined,
    { message: "חובה לשלוח לפחות שדה אחד לעדכון" },
  );

function emptyToNull(v: string | null | undefined): string | null | undefined {
  if (v === undefined) return undefined;
  if (v === null) return null;
  const t = v.trim();
  return t === "" ? null : v;
}

function activeKeysFromBody(body: Record<string, unknown>): string[] {
  const skip = new Set(["id"]);
  return Object.keys(body).filter((k) => !skip.has(k) && body[k] !== undefined);
}

function mapAliases(body: Record<string, unknown>): Record<string, unknown> {
  const b = { ...body };
  if ("pickup_location" in b && b.pickup_address === undefined) {
    b.pickup_address = b.pickup_location;
    delete b.pickup_location;
  }
  if ("ngo_name" in b && b.target_ngo_name === undefined) {
    b.target_ngo_name = b.ngo_name;
    delete b.ngo_name;
  }
  return b;
}

function keysForRbac(body: Record<string, unknown>): string[] {
  const b = mapAliases(body);
  return activeKeysFromBody(b);
}

function buildPatch(b: z.infer<typeof bodySchema>): Record<string, string | null> {
  const patch: Record<string, string | null> = {};
  if (b.funnel_stage !== undefined) patch.funnel_stage = b.funnel_stage;
  if (b.payment_status !== undefined) patch.payment_status = b.payment_status;
  if (b.letter_status !== undefined) patch.letter_status = b.letter_status;
  if (b.pickup_date !== undefined) patch.pickup_date = emptyToNull(b.pickup_date) ?? null;
  if (b.pickup_time !== undefined) patch.pickup_time = emptyToNull(b.pickup_time) ?? null;
  /** מסדי ישן: pickup_slot_id NOT NULL — איפוס פריסט דורש מחרוזת ריקה */
  if (b.pickup_slot_id !== undefined) {
    const raw = b.pickup_slot_id;
    patch.pickup_slot_id = raw === null || raw === "" ? "" : raw.trim();
  }
  /** מסדי ישן: scheduled_region NOT NULL — null מהפריסט הופך ל־"" כדי לא לשבור עדכון */
  if (b.scheduled_region !== undefined) {
    patch.scheduled_region = emptyToNull(b.scheduled_region) ?? "";
  }
  if (b.scheduled_slot !== undefined) {
    patch.scheduled_slot = emptyToNull(b.scheduled_slot) ?? "";
  }
  if (b.pickup_address !== undefined) patch.pickup_address = emptyToNull(b.pickup_address) ?? null;
  if (b.pickup_status !== undefined) patch.pickup_status = b.pickup_status;
  if (b.delivery_status !== undefined) patch.delivery_status = b.delivery_status;
  if (b.target_ngo_name !== undefined) {
    patch.target_ngo_name = emptyToNull(b.target_ngo_name) ?? null;
  }
  if (b.target_ngo_city !== undefined) patch.target_ngo_city = emptyToNull(b.target_ngo_city) ?? null;
  if (b.delivery_time !== undefined) {
    const raw = b.delivery_time;
    patch.delivery_time = raw === null || raw === "" ? null : raw;
  }
  if (b.first_name !== undefined) patch.first_name = emptyToNull(b.first_name) ?? null;
  if (b.last_name !== undefined) patch.last_name = emptyToNull(b.last_name) ?? null;
  if (b.phone !== undefined) patch.phone = emptyToNull(b.phone) ?? null;
  if (b.email !== undefined) patch.email = emptyToNull(b.email) ?? null;
  if (b.address !== undefined) patch.address = emptyToNull(b.address) ?? null;
  if (b.street_name !== undefined) patch.street_name = emptyToNull(b.street_name) ?? null;
  if (b.house_number !== undefined) patch.house_number = emptyToNull(b.house_number) ?? null;
  if (b.apartment_number !== undefined) patch.apartment_number = emptyToNull(b.apartment_number) ?? null;
  if (b.floor !== undefined) patch.floor = emptyToNull(b.floor) ?? null;
  if (b.child_name !== undefined) patch.child_name = emptyToNull(b.child_name) ?? null;
  if (b.pickup_notes !== undefined) patch.pickup_notes = emptyToNull(b.pickup_notes) ?? null;
  if (b.address_notes !== undefined) patch.address_notes = emptyToNull(b.address_notes) ?? null;
  if (b.door_code !== undefined) patch.door_code = emptyToNull(b.door_code) ?? null;
  if (b.portal_fulfillment_stage !== undefined) {
    patch.portal_fulfillment_stage = b.portal_fulfillment_stage.trim();
  }
  if (b.portal_kit_delivered_sms_at !== undefined) {
    const raw = b.portal_kit_delivered_sms_at;
    patch.portal_kit_delivered_sms_at = raw === null || raw === "" ? null : raw;
  }
  return patch;
}

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const raw = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  if (!verifyAdminSessionCookie(raw)) {
    return NextResponse.json({ error: "אין הרשאה" }, { status: 401 });
  }
  const session = getAdminSessionFromCookie(raw);
  const role: AdminDashboardRole = session?.role ?? "admin";

  let bodyRaw: Record<string, unknown>;
  try {
    bodyRaw = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "גוף הבקשה לא תקין" }, { status: 400 });
  }

  const rbacMsg = donationPatchForbiddenMessage(role, keysForRbac(bodyRaw));
  if (rbacMsg) {
    return NextResponse.json({ error: rbacMsg }, { status: 403 });
  }

  const body = mapAliases(bodyRaw);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    const detail = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
    return NextResponse.json({ error: "נתונים לא תקינים", detail }, { status: 400 });
  }

  if (
    parsed.data.portal_fulfillment_stage !== undefined &&
    !isPortalFulfillmentStage(parsed.data.portal_fulfillment_stage.trim())
  ) {
    return NextResponse.json({ error: "שלב פורטל לא תקין" }, { status: 400 });
  }

  const patch = buildPatch(parsed.data) as Record<string, string | null>;
  if (patch.portal_fulfillment_stage === "kit_delivered" && patch.portal_kit_delivered_sms_at === undefined) {
    patch.portal_kit_delivered_sms_at = new Date().toISOString();
  }

  try {
    const supabase = createServiceRoleClient();
    const { error } = await supabase.from("donations").update(patch).eq("id", parsed.data.id);
    if (error) {
      console.error(error);
      const hint = "message" in error && typeof error.message === "string" ? error.message : "";
      return NextResponse.json({ error: "העדכון נכשל", detail: hint }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "שגיאת שרת" }, { status: 500 });
  }
}
