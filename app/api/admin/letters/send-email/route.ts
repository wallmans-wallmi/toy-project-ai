import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { ADMIN_SESSION_COOKIE, getAdminSessionFromCookie, verifyAdminSessionCookie } from "@/lib/admin-auth";
import type { AdminDashboardRole } from "@/lib/admin-role-types";
import { createServiceRoleClient } from "@/lib/supabase/service";

export const runtime = "nodejs";

const bodySchema = z.object({ donationId: z.string().uuid() });

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const raw = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  if (!verifyAdminSessionCookie(raw)) {
    return NextResponse.json({ error: "אין הרשאה" }, { status: 401 });
  }
  const session = getAdminSessionFromCookie(raw);
  const role = session?.role as AdminDashboardRole | undefined;
  if (role !== "admin" && role !== "office") {
    return NextResponse.json({ error: "רק משרד או אדמין יכולים לשלוח מייל" }, { status: 403 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "גוף לא תקין" }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "מזהה לא תקין" }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM_EMAIL?.trim();
  if (!apiKey || !from) {
    return NextResponse.json(
      { error: "אין שליחת מייל מוגדרת — הוסיפו RESEND_API_KEY ו־RESEND_FROM_EMAIL ב־.env" },
      { status: 503 },
    );
  }

  try {
    const supabase = createServiceRoleClient();
    const { data: row, error } = await supabase
      .from("donations")
      .select("email, first_name, child_name, ai_letter_content, ai_generated_letter")
      .eq("id", parsed.data.donationId)
      .maybeSingle();
    if (error || !row) {
      return NextResponse.json({ error: "לא נמצאה תרומה" }, { status: 404 });
    }
    const email = typeof row.email === "string" ? row.email.trim() : "";
    if (!email.includes("@")) {
      return NextResponse.json({ error: "אין אימייל תקין לתורם" }, { status: 400 });
    }
    const letter =
      (typeof row.ai_letter_content === "string" && row.ai_letter_content.trim()) ||
      (typeof row.ai_generated_letter === "string" && row.ai_generated_letter.trim()) ||
      "";
    if (!letter) {
      return NextResponse.json({ error: "אין עדיין מכתב לשלוח" }, { status: 400 });
    }

    const child = typeof row.child_name === "string" ? row.child_name.trim() : "";
    const subject = `מכתב מנפרדים בחיוך${child ? ` — ${child}` : ""}`;
    const html = `<div dir="rtl" style="font-family:system-ui,sans-serif;text-align:right;padding:16px;background:#F9F5FF"><pre style="white-space:pre-wrap;font-size:14px;color:#111">${escapeHtml(letter)}</pre></div>`;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [email], subject, html }),
    });
    if (!res.ok) {
      const t = await res.text().catch(() => "");
      console.error("Resend error", res.status, t.slice(0, 400));
      return NextResponse.json({ error: "שליחת המייל נכשלה" }, { status: 502 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "שגיאת שרת" }, { status: 500 });
  }
}
