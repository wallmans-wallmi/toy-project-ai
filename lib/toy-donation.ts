/**
 * לוגיקת פריטי תרומה בממשק
 * ב-Supabase השדה נשמר בעמודה `toy_items` (jsonb) בשם היסטורי, והתוכן הוא מערך פריטים כללי
 */
export type ToySizeId = "small" | "medium" | "large";

export type ToyItemRow = {
  id: string;
  name: string;
  color: string;
  size: ToySizeId | "";
};

export type ToyItemPayload = {
  name: string;
  color: string;
  size: ToySizeId;
};

/** כינוי סמנטי זהה ל-ToyItemRow לשימוש במסמכים ובקוד חדש */
export type DonationItemRow = ToyItemRow;
export type DonationItemPayload = ToyItemPayload;

export const TOY_SIZE_OPTIONS: readonly { id: ToySizeId; label: string }[] = [
  { id: "small", label: "קטן" },
  { id: "medium", label: "בינוני" },
  { id: "large", label: "גדול" },
] as const;

function newToyId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `t-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function createEmptyToyItem(): ToyItemRow {
  return { id: newToyId(), name: "", color: "", size: "" };
}

export function toySizeLabel(size: ToySizeId): string {
  const found = TOY_SIZE_OPTIONS.find((o) => o.id === size);
  return found?.label ?? size;
}

export function isToySizeId(value: unknown): value is ToySizeId {
  return value === "small" || value === "medium" || value === "large";
}

/**
 * פרסור מערך פריטים מה-API (checkout). מחזיר null אם המבנה לא תקין.
 * מערך ריק חוקי למסלולי גמילה בלי פריטים מפורטים.
 */
export function parseToyItemsPayload(raw: unknown): ToyItemPayload[] | null {
  if (!Array.isArray(raw)) return null;
  if (raw.length === 0) return [];
  const out: ToyItemPayload[] = [];
  for (const entry of raw) {
    if (!entry || typeof entry !== "object") return null;
    const o = entry as Record<string, unknown>;
    const name = typeof o.name === "string" ? o.name.trim() : "";
    const color = typeof o.color === "string" ? o.color.trim() : "";
    const size = o.size;
    if (!name || !color || !isToySizeId(size)) return null;
    out.push({ name, color, size });
  }
  return out;
}

/** פריטים מלאים בלבד, לשמירה ותצוגה */
export function normalizedToyPayloads(rows: ToyItemRow[]): ToyItemPayload[] {
  return rows
    .filter((r) => r.name.trim() && r.color.trim() && r.size && isToySizeId(r.size))
    .map((r) => ({
      name: r.name.trim(),
      color: r.color.trim(),
      size: r.size as ToySizeId,
    }));
}

/** טקסט קריא לעמודת legacy toy_description */
export function formatToyDescriptionFromPayloads(items: ToyItemPayload[]): string {
  if (items.length === 0) return "";
  return items
    .map((i) => `${i.name} ${i.color} ${toySizeLabel(i.size)}`)
    .join("\n");
}

/** שורות פריטים מלאות ללא שורות חצי מלאות */
export function donationItemsRowsComplete(rows: ToyItemRow[]): boolean {
  const partial = rows.some((r) => {
    const touched = Boolean(r.name.trim() || r.color.trim() || r.size);
    const complete = Boolean(r.name.trim() && r.color.trim() && r.size);
    return touched && !complete;
  });
  if (partial) return false;
  return normalizedToyPayloads(rows).length >= 1;
}

/** האם יש לפחות פריט מלא ללא שורות חלקיות, ואישור איכות */
export function toysStepIsValid(rows: ToyItemRow[], toysQualityConfirmed: boolean): boolean {
  if (!toysQualityConfirmed) return false;
  return donationItemsRowsComplete(rows);
}
