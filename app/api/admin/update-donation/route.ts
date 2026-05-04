import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionCookie } from "@/lib/admin-auth";
import { createServiceRoleClient } from "@/lib/supabase/service";

export const runtime = "nodejs";

const PAYMENT = ["pending", "completed", "cancelled"] as const;
const LETTER = ["pending", "completed", "failed", "generated", "sent"] as const;

const bodySchema = z
  .object({
    id: z.string().uuid(),
    payment_status: z.enum(PAYMENT).optional(),
    letter_status: z.enum(LETTER).optional(),
  })
  .refine((b) => b.payment_status !== undefined || b.letter_status !== undefined, {
    message: "חובה לשלוח לפחות שדה אחד לעדכון",
  });

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

  const { id, payment_status, letter_status } = parsed.data;
  const patch: Record<string, string> = {};
  if (payment_status !== undefined) patch.payment_status = payment_status;
  if (letter_status !== undefined) patch.letter_status = letter_status;

  try {
    const supabase = createServiceRoleClient();
    const { error } = await supabase.from("donations").update(patch).eq("id", id);
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
