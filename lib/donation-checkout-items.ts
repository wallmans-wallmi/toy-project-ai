import { z } from "zod";
import type { DonationFormState } from "@/hooks/use-donation-form";
import type { DonationJourneyId } from "@/lib/donation-journey";
import { isDonationJourneyId, isLegacyWeaningJourneyId, isToyDropoffJourney } from "@/lib/donation-journey";
import { activePackingChildNames, clampPackingExtraBagCount } from "@/lib/donation-packing-kits";
import {
  isToySizeId,
  toySizeLabel,
  type ToyItemRow,
  type ToySizeId,
} from "@/lib/toy-donation";

export type DonationToyItemToy = {
  type: "toy";
  childName: string;
  itemName: string;
  color: string;
  size: ToySizeId;
  /** שקיות אריזה נוספות לשורה זו (מעבר לשקית הכלולה) */
  extra_bags_count?: number;
};

export type DonationToyItemPacifier = {
  type: "pacifier";
  childName: string;
  quantity: number;
};

export type DonationToyItemBottlesFormula = {
  type: "bottles_formula";
  subType: "bottles" | "formula";
  note?: string;
};

export type DonationToyItemDiapers = {
  type: "diapers";
  status: "closed" | "loose" | "both";
};

/** פריטים ב־JSONB — צעצועים חדשים + מבנים ישנים לתצוגה במסד */
export type DonationToyItemJson =
  | DonationToyItemToy
  | DonationToyItemPacifier
  | DonationToyItemBottlesFormula
  | DonationToyItemDiapers;

export type CheckoutToyItemJson = DonationToyItemJson;

const sizeEnum = z.enum(["small", "medium", "large"]);

const legacyToyRowSchema = z.object({
  name: z.string().trim().min(1),
  color: z.string().trim().min(1),
  size: sizeEnum,
  line_type: z.literal("toy").optional(),
  item_child_name: z.string().trim().optional(),
});

const extraBagsField = z
  .union([z.number(), z.string()])
  .optional()
  .transform((v) => {
    if (v === undefined || v === null || v === "") return undefined;
    const n = typeof v === "string" ? Number.parseInt(v, 10) : v;
    if (!Number.isFinite(n)) return undefined;
    const t = Math.trunc(n as number);
    if (t <= 0) return undefined;
    return Math.min(20, t);
  });

const newToyRowSchema = z
  .object({
    type: z.literal("toy"),
    childName: z.string().optional().default(""),
    itemName: z.string().trim().optional(),
    name: z.string().trim().optional(),
    color: z.string().trim().min(1),
    size: sizeEnum,
    extra_bags_count: extraBagsField,
  })
  .transform((x): DonationToyItemToy => {
    const itemName = (x.itemName ?? x.name ?? "").trim();
    const row: DonationToyItemToy = {
      type: "toy",
      childName: (x.childName ?? "").trim(),
      itemName,
      color: x.color.trim(),
      size: x.size,
    };
    const eb = x.extra_bags_count;
    if (eb !== undefined && eb >= 1) {
      row.extra_bags_count = eb;
    }
    return row;
  })
  .refine((row) => row.itemName.length >= 1, { path: ["itemName"], message: "חייב שם פריט" });

function legacyToyToCanonical(data: z.infer<typeof legacyToyRowSchema>): DonationToyItemToy {
  return {
    type: "toy",
    childName: (data.item_child_name ?? "").trim(),
    itemName: data.name.trim(),
    color: data.color.trim(),
    size: data.size,
  };
}

function parseToyJourneyEntry(entry: unknown): DonationToyItemToy | null {
  if (!entry || typeof entry !== "object") return null;
  const o = entry as Record<string, unknown>;
  if (o.type === "toy") {
    const p = newToyRowSchema.safeParse(entry);
    return p.success ? p.data : null;
  }
  const legacy = legacyToyRowSchema.safeParse(entry);
  if (!legacy.success) return null;
  return legacyToyToCanonical(legacy.data);
}

/** פרסור לטופס תרומת צעצועים בלבד (`toy_dropoff`) */
export function parseToyItemsPayload(journeyType: string, raw: unknown): DonationToyItemJson[] | null {
  if (!isToyDropoffJourney(journeyType)) return null;
  if (!Array.isArray(raw)) return null;
  if (raw.length === 0) return [];
  const out: DonationToyItemJson[] = [];
  for (const entry of raw) {
    const row = parseToyJourneyEntry(entry);
    if (!row) return null;
    out.push(row);
  }
  return out;
}

export const parseCheckoutToyItems = parseToyItemsPayload;

export type CheckoutItemsFormInput = {
  journeyType: DonationJourneyId;
  childName: string;
  toyItems: ToyItemRow[];
};

export function buildCheckoutToyItemsJson(input: CheckoutItemsFormInput): unknown[] {
  const { toyItems } = input;
  return toyItems
    .filter((r) => r.name.trim() && r.color.trim() && r.size && isToySizeId(r.size))
    .map((r) => {
      const row: Record<string, unknown> = {
        type: "toy" as const,
        childName: r.itemChildName.trim(),
        itemName: r.name.trim(),
        color: r.color.trim(),
        size: r.size as ToySizeId,
      };
      const eb = clampPackingExtraBagCount(typeof r.extraBagsCount === "number" ? r.extraBagsCount : 0);
      if (eb > 0) row.extra_bags_count = eb;
      return row;
    });
}

/** כשאין שלב פריטים בטופס האיסוף: פריט תווית אחד לכל שם מערכת האריזה, לשמירה תקינה ב־API */
export function buildSyntheticToyPayloadFromPackingForPickup(form: DonationFormState): DonationToyItemToy[] {
  const names = activePackingChildNames(form)
    .map((n) => n.trim())
    .filter(Boolean);
  const who = names.length > 0 ? names : [form.childName.trim() || "הילדים או הילדות"];
  return who.map((childName, idx) => {
    const extra = clampPackingExtraBagCount(form.packingExtraBags[idx] ?? 0);
    const row: DonationToyItemToy = {
      type: "toy",
      childName,
      itemName: "צעצועים לתרומה (פירוט באיסוף)",
      color: "יתואם בשיחה",
      size: "medium",
    };
    if (extra > 0) row.extra_bags_count = extra;
    return row;
  });
}

/** סיכום שקיות נוספות מתוך מערך ה־JSON שנשמר ב־toy_items */
export function sumExtraBagsFromToyPayloads(items: DonationToyItemJson[]): number {
  let s = 0;
  for (const p of items) {
    if (p.type === "toy" && typeof p.extra_bags_count === "number" && p.extra_bags_count > 0) {
      s += Math.min(20, Math.floor(p.extra_bags_count));
    }
  }
  return s;
}

/** ממזגים שקיות נוספות ממצב האריזה לשורות צעצוע (לפי התאמת שם ילד או ילדה לשורה הראשונה שלהם) */
export function mergePackingExtraBagsIntoToyPayloads(
  items: DonationToyItemToy[],
  form: DonationFormState,
): DonationToyItemToy[] {
  const n = form.childCount;
  const used = new Set<number>();
  return items.map((row) => {
    const nm = row.childName.trim();
    let idx = -1;
    for (let i = 0; i < n; i += 1) {
      const cn = form.packingChildNames[i]?.trim() ?? "";
      if (cn && cn === nm && !used.has(i)) {
        idx = i;
        used.add(i);
        break;
      }
    }
    const add = idx >= 0 ? clampPackingExtraBagCount(form.packingExtraBags[idx] ?? 0) : 0;
    if (add <= 0) return row;
    const prev = clampPackingExtraBagCount(row.extra_bags_count ?? 0);
    const merged = Math.min(20, prev + add);
    return { ...row, extra_bags_count: merged > 0 ? merged : undefined };
  });
}

export function formatCheckoutToyItemsDescription(items: DonationToyItemJson[]): string {
  if (items.length === 0) return "";
  return items
    .map((i) => {
      if (i.type === "toy") {
        const base = `${i.itemName} · ${i.color} · ${toySizeLabel(i.size)}`;
        const who = i.childName.trim() ? `${base} (ילד/ה: ${i.childName.trim()})` : base;
        const eb =
          typeof i.extra_bags_count === "number" && i.extra_bags_count > 0
            ? ` · שקיות נוספות: ${i.extra_bags_count}`
            : "";
        return who + eb;
      }
      if (i.type === "pacifier") {
        const who = i.childName.trim() ? `${i.childName.trim()} · ` : "";
        return `${who}מוצצים · כמות ${i.quantity}`;
      }
      if (i.type === "bottles_formula") {
        const label = i.subType === "formula" ? "פורמולה" : "בקבוקים";
        return i.note ? `${label} · ${i.note}` : label;
      }
      if (i.type === "diapers") {
        return `חיתולים · ${i.status}`;
      }
      return "";
    })
    .filter(Boolean)
    .join("\n");
}

export function pickupUrlWithJourney(journeyId: DonationJourneyId = "toy_dropoff"): string {
  return `/pickup?journey=${encodeURIComponent(journeyId)}`;
}

/** קישורי ישנים ממסלולי גמילה מנותבים לתרומת צעצועים */
export function journeyFromSearchParam(raw: string | null | undefined): DonationJourneyId | null {
  if (!raw) return null;
  if (isDonationJourneyId(raw)) return raw;
  if (isLegacyWeaningJourneyId(raw)) return "toy_dropoff";
  return null;
}

export function summaryLinesFromFormInput(input: CheckoutItemsFormInput): string[] {
  const rows = buildCheckoutToyItemsJson(input) as DonationToyItemToy[];
  return rows.map((i) => {
    if (i.childName.trim()) {
      return `${i.childName.trim()}: ${i.itemName} · ${i.color} · ${toySizeLabel(i.size)}`;
    }
    return `${i.itemName} · ${i.color} · ${toySizeLabel(i.size)}`;
  });
}
