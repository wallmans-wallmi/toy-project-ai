/** ספרות בלבד לצורך השוואת מספרים בין טופס תרומה לבין Auth */
export function normalizePhoneDigits(input: string | number | null | undefined): string {
  if (input == null) return "";
  return String(input).replace(/\D/g, "");
}

/**
 * מפתח אחיד להשוואת מספר ישראלי בין טופס (050…) לבין Supabase Auth (+97250…).
 * בלי זה סנכרון הפורטל לא מוצא תרומות ולא ממלא שם בפרופיל.
 */
export function phoneComparableKey(input: string | number | null | undefined): string {
  let d = normalizePhoneDigits(input);
  if (d.startsWith("972")) d = d.slice(3);
  if (d.startsWith("0")) d = d.slice(1);
  return d;
}

/**
 * ממיר קלט ישראלי נפוץ ל־E.164 (למשל 0501234567 → +972501234567).
 * מחזיר null אם אין מספיק ספרות.
 */
export function toE164IlPhone(raw: string): string | null {
  let d = normalizePhoneDigits(raw);
  if (d.startsWith("972")) {
    d = d.slice(3);
  }
  if (d.startsWith("0")) {
    d = d.slice(1);
  }
  if (d.length < 8 || d.length > 10) {
    return null;
  }
  return `+972${d}`;
}
