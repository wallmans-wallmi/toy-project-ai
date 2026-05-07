"use client";

/** קריאת סנכרון שרת אחרי התחברות OTP — קישור תרומות ויצירת פרופיל לפי טלפון */
export async function requestPortalCustomerSync(): Promise<{ ok: true } | { ok: false; message: string }> {
  try {
    const res = await fetch("/api/portal/sync", { method: "POST", credentials: "same-origin" });
    let body: { success?: boolean; error?: string };
    try {
      body = (await res.json()) as { success?: boolean; error?: string };
    } catch {
      return { ok: false, message: "תשובת השרת לא תקינה, נסו שוב" };
    }
    if (!res.ok || !body.success) {
      return { ok: false, message: body.error ?? "הסנכרון נכשל" };
    }
    return { ok: true };
  } catch {
    return { ok: false, message: "בעיית רשת: נסו שוב בעוד רגע" };
  }
}
