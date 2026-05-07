import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { isDevAuthBypassEnabled } from "@/lib/portal/dev-mock-otp";
import { createServiceRoleClient } from "@/lib/supabase/service";
import type { User } from "@supabase/supabase-js";

export const runtime = "nodejs";

const LIST_PER_PAGE = 200;
const MAX_PAGES = 25;

async function findUserByPhone(admin: ReturnType<typeof createServiceRoleClient>, phone: string): Promise<User | null> {
  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: LIST_PER_PAGE });
    if (error) return null;
    const hit = data.users.find((u) => u.phone === phone);
    if (hit) return hit;
    if (data.users.length < LIST_PER_PAGE) break;
  }
  return null;
}

async function ensureEmailForMagicLink(
  admin: ReturnType<typeof createServiceRoleClient>,
  user: User,
): Promise<{ userId: string; email: string }> {
  const confirmed = user.email?.trim();
  if (confirmed) return { userId: user.id, email: confirmed };
  const synthetic = `phone-${user.id.replace(/-/g, "")}@nifradim-dev.mock`;
  const { error } = await admin.auth.admin.updateUserById(user.id, {
    email: synthetic,
    email_confirm: true,
  });
  if (error) throw new Error(error.message);
  return { userId: user.id, email: synthetic };
}

/** התחברות דמה לפיתוח בלבד (`NODE_ENV === "development"`). לוגיקת ה־OTP: `hooks/use-portal-phone-auth.ts` */
export async function POST(req: Request) {
  if (!isDevAuthBypassEnabled()) {
    return NextResponse.json({ error: "לא זמין" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "גוף לא תקין" }, { status: 400 });
  }
  const phone = typeof body === "object" && body !== null && "phone" in body ? String((body as { phone: string }).phone).trim() : "";
  if (!phone.startsWith("+")) {
    return NextResponse.json({ error: "מספר לא תקין" }, { status: 400 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    return NextResponse.json({ error: "שרת לא מוגדר" }, { status: 500 });
  }

  try {
    const admin = createServiceRoleClient();
    let user = await findUserByPhone(admin, phone);

    if (!user) {
      const mockEmail = `new-${phone.replace(/\D/g, "")}@nifradim-dev.mock`;
      const { data: created, error: createErr } = await admin.auth.admin.createUser({
        phone,
        phone_confirm: true,
        email: mockEmail,
        email_confirm: true,
        user_metadata: { phone },
      });
      if (created?.user) {
        user = created.user;
      } else {
        user = await findUserByPhone(admin, phone);
        if (!user) {
          return NextResponse.json({ error: createErr?.message ?? "לא ניתן ליצור משתמש לדמה" }, { status: 400 });
        }
      }
    }

    const { email } = await ensureEmailForMagicLink(admin, user);

    const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
      type: "magiclink",
      email,
    });
    if (linkErr || !linkData?.properties?.email_otp) {
      return NextResponse.json({ error: linkErr?.message ?? "generateLink נכשל" }, { status: 500 });
    }

    const anon = createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data: sessionData, error: verifyErr } = await anon.auth.verifyOtp({
      email,
      token: linkData.properties.email_otp,
      type: "magiclink",
    });
    if (verifyErr || !sessionData.session) {
      return NextResponse.json({ error: verifyErr?.message ?? "אימות magic link נכשל" }, { status: 500 });
    }

    return NextResponse.json({
      access_token: sessionData.session.access_token,
      refresh_token: sessionData.session.refresh_token,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "שגיאה";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
