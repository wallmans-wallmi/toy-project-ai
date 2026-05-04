import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionCookie } from "@/lib/admin-auth";
import { createServiceRoleClient } from "@/lib/supabase/service";

export const runtime = "nodejs";

const PAYMENT = ["pending", "completed", "cancelled"] as const;
const LETTER = ["pending", "completed", "failed", "generated", "sent"] as const;
const PICKUP_STATUS = ["pending", "picked_up", "failed"] as const;
const DELIVERY_STATUS = ["at_warehouse", "sent_to_ngo", "delivered"] as const;

const bodySchema = z
  .object({
    id: z.string().uuid(),
    payment_status: z.enum(PAYMENT).optional(),
    letter_status: z.enum(LETTER).optional(),
    pickup_date: z.union([z.string(), z.null()]).optional(),
    pickup_time: z.union([z.string(), z.null()]).optional(),
    pickup_address: z.union([z.string(), z.null()]).optional(),
    pickup_status: z.enum(PICKUP_STATUS).optional(),
    delivery_status: z.enum(DELIVERY_STATUS).optional(),
    target_ngo_name: z.union([z.string(), z.null()]).optional(),
    target_ngo_city: z.union([z.string(), z.null()]).optional(),
    delivery_time: z.union([z.string(), z.null()]).optional(),
  })
  .refine(
    (b) =>
      b.payment_status !== undefined ||
      b.letter_status !== undefined ||
      b.pickup_date !== undefined ||
      b.pickup_time !== undefined ||
      b.pickup_address !== undefined ||
      b.pickup_status !== undefined ||
      b.delivery_status !== undefined ||
      b.target_ngo_name !== undefined ||
      b.target_ngo_city !== undefined ||
      b.delivery_time !== undefined,
    { message: "חובה לשלוח לפחות שדה אחד לעדכון" },
  );

function emptyToNull(v: string | null | undefined): string | null | undefined {
  if (v === undefined) return undefined;
  if (v === null) return null;
  const t = v.trim();
  return t === "" ? null : v;
}

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const session = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  if (!verifyAdminSessionCookie(session)) {
    return NextResponse.json({ error: "אין הרשאה" }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "גוף הבקשה לא תקין" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "נתונים לא תקינים" }, { status: 400 });
  }

  const b = parsed.data;
  const patch: Record<string, string | null> = {};
  if (b.payment_status !== undefined) patch.payment_status = b.payment_status;
  if (b.letter_status !== undefined) patch.letter_status = b.letter_status;
  if (b.pickup_date !== undefined) patch.pickup_date = emptyToNull(b.pickup_date) ?? null;
  if (b.pickup_time !== undefined) patch.pickup_time = emptyToNull(b.pickup_time) ?? null;
  if (b.pickup_address !== undefined) patch.pickup_address = emptyToNull(b.pickup_address) ?? null;
  if (b.pickup_status !== undefined) patch.pickup_status = b.pickup_status;
  if (b.delivery_status !== undefined) patch.delivery_status = b.delivery_status;
  if (b.target_ngo_name !== undefined) patch.target_ngo_name = emptyToNull(b.target_ngo_name) ?? null;
  if (b.target_ngo_city !== undefined) patch.target_ngo_city = emptyToNull(b.target_ngo_city) ?? null;
  if (b.delivery_time !== undefined) {
    const raw = b.delivery_time;
    if (raw === null || raw === "") patch.delivery_time = null;
    else patch.delivery_time = raw;
  }

  try {
    const supabase = createServiceRoleClient();
    const { error } = await supabase.from("donations").update(patch).eq("id", b.id);
    if (error) {
      console.error(error);
      return NextResponse.json({ error: "העדכון נכשל" }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "שגיאת שרת" }, { status: 500 });
  }
}
