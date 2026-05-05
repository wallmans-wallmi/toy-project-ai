/** מספר ל־wa.me (ספרות בלבד, ישראל: 972…) */
export function normalizeWhatsAppDigits(phone: string | null | undefined): string | null {
  if (!phone) return null;
  const d = phone.replace(/\D/g, "");
  if (d.length < 8) return null;
  if (d.startsWith("972")) return d;
  if (d.startsWith("0")) return `972${d.slice(1)}`;
  if (d.startsWith("5") && d.length === 9) return `972${d}`;
  return d;
}

export function buildLetterWhatsAppUrl(phone: string | null | undefined, letterText: string, maxLen = 1600): string | null {
  const digits = normalizeWhatsAppDigits(phone);
  if (!digits) return null;
  const text = letterText.trim().slice(0, maxLen);
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}
