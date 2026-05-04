/** ימי השבוע לפי Date.getDay() / UTC — ראשון = 0 */
const HEB_DOW = ["יום א'", "יום ב'", "יום ג'", "יום ד'", "יום ה'", "יום ו'", "שבת"];

export function toLocalISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** שבעת הימים הבאים מהיום המקומי */
export function getNextSevenPickupDays(): { iso: string; label: string }[] {
  const base = new Date();
  base.setHours(0, 0, 0, 0);
  const out: { iso: string; label: string }[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    const iso = toLocalISODate(d);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    out.push({ iso, label: `${HEB_DOW[d.getDay()]}, ${dd}.${mm}` });
  }
  return out;
}

/** תווית יום מתאריך YYYY-MM-DD (עקבי בשרת ובלקוח) */
export function formatPickupDayLabelFromISO(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!m) return iso;
  const y = Number(m[1]);
  const mo = Number(m[2]) - 1;
  const dayNum = Number(m[3]);
  const dow = new Date(Date.UTC(y, mo, dayNum)).getUTCDay();
  return `${HEB_DOW[dow]}, ${m[3]}.${m[2]}`;
}
