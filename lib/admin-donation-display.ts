import { toySizeLabel } from "@/lib/toy-donation";

/** תיאור קריא בעברית ל־toy_items (JSONB) — פורמט אחיד ו־legacy */
export function formatToyItemsForAdmin(toyItems: unknown): string {
  if (!Array.isArray(toyItems) || toyItems.length === 0) return "אין פריטים מפורטים";
  const lines: string[] = [];
  for (const entry of toyItems) {
    if (!entry || typeof entry !== "object") continue;
    const o = entry as Record<string, unknown>;
    const t = o.type;
    if (t === "toy") {
      const itemName = typeof o.itemName === "string" ? o.itemName.trim() : "";
      const name = typeof o.name === "string" ? o.name.trim() : "";
      const label = itemName || name;
      const color = typeof o.color === "string" ? o.color.trim() : "";
      const size = typeof o.size === "string" ? o.size.trim() : "";
      const child = typeof o.childName === "string" ? o.childName.trim() : "";
      const sizeHe = size && ["small", "medium", "large"].includes(size) ? toySizeLabel(size as "small" | "medium" | "large") : size;
      const ebRaw = o.extra_bags_count ?? o.extraBagsCount;
      const eb =
        typeof ebRaw === "number" && Number.isFinite(ebRaw) && ebRaw > 0
          ? Math.min(20, Math.floor(ebRaw))
          : typeof ebRaw === "string" && ebRaw.trim()
            ? Math.min(20, Math.floor(Number.parseInt(ebRaw, 10)) || 0)
            : 0;
      const bagsNote = eb > 0 ? `שקיות נוספות: ${eb}` : "";
      if (label) {
        const base = [label, color, sizeHe, bagsNote].filter(Boolean).join(" · ");
        lines.push(child ? `${child}: ${base}` : base);
      }
      continue;
    }
    if (t === "pacifier") {
      const q = typeof o.quantity === "number" ? o.quantity : "";
      const child = typeof o.childName === "string" ? o.childName.trim() : "";
      lines.push([child && `ילד או ילדה: ${child}`, q !== "" && `מוצצים: ${q}`].filter(Boolean).join(" · "));
      continue;
    }
    if (t === "bottles_formula") {
      const sub = o.subType === "formula" ? "פורמולה" : o.subType === "bottles" ? "בקבוקים" : "";
      const note = typeof o.note === "string" ? o.note.trim() : "";
      lines.push([sub, note].filter(Boolean).join(" · "));
      continue;
    }
    if (t === "diapers") {
      const status = typeof o.status === "string" ? o.status.trim() : "";
      if (status) lines.push(`חיתולים: ${status}`);
      continue;
    }
    const lineType = o.line_type;
    const name = typeof o.name === "string" ? o.name.trim() : "";
    const color = typeof o.color === "string" ? o.color.trim() : "";
    const size = typeof o.size === "string" ? o.size.trim() : "";
    const qty = typeof o.quantity === "number" ? o.quantity : undefined;
    if (lineType === "pacifier" && qty) {
      lines.push(`מוצצים · כמות ${qty}`);
      continue;
    }
    if (lineType === "bottle" && o.bottle_sub) {
      lines.push(o.bottle_sub === "formula" ? "פורמולה" : "בקבוקים");
      continue;
    }
    if (lineType === "diaper" && o.diaper_package) {
      lines.push(`חיתולים: ${String(o.diaper_package)}`);
      continue;
    }
    if (name) {
      const sizeHe = size && ["small", "medium", "large"].includes(size) ? toySizeLabel(size as "small" | "medium" | "large") : size;
      lines.push([name, color, sizeHe].filter(Boolean).join(" · "));
    }
  }
  return lines.length ? lines.join(" | ") : "אין פירוט";
}

/** רשימת שורות לתצוגת כרטיס מסלול (מבוסס על אותו פירוק כמו formatToyItemsForAdmin) */
export function toyItemsLinesForRoute(toyItems: unknown): string[] {
  const flat = formatToyItemsForAdmin(toyItems);
  if (flat.startsWith("אין")) return [];
  return flat.split(" | ").map((s) => s.trim()).filter(Boolean);
}
