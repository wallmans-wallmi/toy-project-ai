import { z } from "zod";
import type { DonationJourneyId } from "@/lib/donation-journey";
import { isDonationJourneyId, isToyDropoffJourney } from "@/lib/donation-journey";
import {
  isToySizeId,
  toySizeLabel,
  type ToyItemRow,
  type ToySizeId,
} from "@/lib/toy-donation";

// ─── Canonical `toy_items` JSON (JSONB) — אחיד לכל המסלולים + תאימות ל־legacy ───

export type DonationToyItemToy = {
  type: "toy";
  childName: string;
  itemName: string;
  color: string;
  size: ToySizeId;
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

export type DonationToyItemJson =
  | DonationToyItemToy
  | DonationToyItemPacifier
  | DonationToyItemBottlesFormula
  | DonationToyItemDiapers;

/** כינוי היסטורי — זהה ל־DonationToyItemJson */
export type CheckoutToyItemJson = DonationToyItemJson;

const sizeEnum = z.enum(["small", "medium", "large"]);

const legacyToyRowSchema = z.object({
  name: z.string().trim().min(1),
  color: z.string().trim().min(1),
  size: sizeEnum,
  line_type: z.literal("toy").optional(),
  item_child_name: z.string().trim().optional(),
});

const newToyRowSchema = z
  .object({
    type: z.literal("toy"),
    childName: z.string().optional().default(""),
    itemName: z.string().trim().optional(),
    name: z.string().trim().optional(),
    color: z.string().trim().min(1),
    size: sizeEnum,
  })
  .transform((x) => {
    const itemName = (x.itemName ?? x.name ?? "").trim();
    return {
      type: "toy" as const,
      childName: (x.childName ?? "").trim(),
      itemName,
      color: x.color.trim(),
      size: x.size,
    };
  })
  .pipe(
    z.object({
      type: z.literal("toy"),
      childName: z.string(),
      itemName: z.string().min(1),
      color: z.string(),
      size: sizeEnum,
    }),
  );

const pacifierLegacySchema = z.object({
  line_type: z.literal("pacifier"),
  name: z.string().min(1),
  color: z.string().min(1),
  size: sizeEnum,
  quantity: z.number().int().positive(),
});

const pacifierCanonicalSchema = z.object({
  type: z.literal("pacifier"),
  childName: z.string().optional().default(""),
  quantity: z.number().int().positive(),
});

const bottleLegacySchema = z.object({
  line_type: z.literal("bottle"),
  name: z.string().min(1),
  color: z.string().min(1),
  size: sizeEnum,
  bottle_sub: z.enum(["bottles", "formula"]),
});

const bottleCanonicalSchema = z.object({
  type: z.literal("bottles_formula"),
  subType: z.enum(["bottles", "formula"]),
  note: z.string().optional(),
});

const diaperLegacySchema = z.object({
  line_type: z.literal("diaper"),
  name: z.string().min(1),
  color: z.string().min(1),
  size: sizeEnum,
  diaper_package: z.enum(["closed", "loose", "both"]),
});

const diaperCanonicalSchema = z.object({
  type: z.literal("diapers"),
  status: z.enum(["closed", "loose", "both"]),
});

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

/**
 * פרסור מערך `toy_items` מה־API — פורמט אחיד (`type`) + פורמט legacy (`line_type` / שורת צעצוע ישנה).
 * מחזיר null רק כשהמבנה באמת לא תואם למסלול.
 */
export function parseToyItemsPayload(
  journeyType: DonationJourneyId,
  raw: unknown,
): DonationToyItemJson[] | null {
  if (!Array.isArray(raw)) return null;

  if (isToyDropoffJourney(journeyType)) {
    if (raw.length === 0) return [];
    const out: DonationToyItemJson[] = [];
    for (const entry of raw) {
      const row = parseToyJourneyEntry(entry);
      if (!row) return null;
      out.push(row);
    }
    return out;
  }

  if (raw.length !== 1) return null;
  const entry = raw[0];
  if (!entry || typeof entry !== "object") return null;

  if (journeyType === "pacifier_weaning") {
    const o = entry as Record<string, unknown>;
    if (o.type === "pacifier") {
      const p = pacifierCanonicalSchema.safeParse(entry);
      return p.success
        ? [{ type: "pacifier", childName: p.data.childName.trim(), quantity: p.data.quantity }]
        : null;
    }
    const leg = pacifierLegacySchema.safeParse(entry);
    if (leg.success) {
      return [{ type: "pacifier", childName: "", quantity: leg.data.quantity }];
    }
    return null;
  }

  if (journeyType === "bottle_weaning") {
    const o = entry as Record<string, unknown>;
    if (o.type === "bottles_formula") {
      const p = bottleCanonicalSchema.safeParse(entry);
      return p.success
        ? [{ type: "bottles_formula", subType: p.data.subType, note: p.data.note }]
        : null;
    }
    const leg = bottleLegacySchema.safeParse(entry);
    if (leg.success) {
      return [
        {
          type: "bottles_formula",
          subType: leg.data.bottle_sub,
          note: leg.data.color?.trim() || undefined,
        },
      ];
    }
    return null;
  }

  if (journeyType === "diaper_weaning") {
    const o = entry as Record<string, unknown>;
    if (o.type === "diapers") {
      const p = diaperCanonicalSchema.safeParse(entry);
      return p.success ? [{ type: "diapers", status: p.data.status }] : null;
    }
    const leg = diaperLegacySchema.safeParse(entry);
    if (leg.success) {
      return [{ type: "diapers", status: leg.data.diaper_package }];
    }
    return null;
  }

  return null;
}

/** @deprecated השתמשו ב־parseToyItemsPayload */
export const parseCheckoutToyItems = parseToyItemsPayload;

export type CheckoutItemsFormInput = {
  journeyType: DonationJourneyId;
  childName: string;
  toyItems: ToyItemRow[];
  pacifierQuantity: string;
  bottleSubChoice: "bottles" | "formula" | "";
  diaperPackageType: "closed" | "loose" | "both" | "";
};

/** בניית מערך `toy_items` עשיר ל־checkout / עגלה נטושה (payment_status = pending) */
export function buildCheckoutToyItemsJson(input: CheckoutItemsFormInput): unknown[] {
  const { journeyType, childName, toyItems, pacifierQuantity, bottleSubChoice, diaperPackageType } =
    input;

  if (isToyDropoffJourney(journeyType)) {
    return toyItems
      .filter((r) => r.name.trim() && r.color.trim() && r.size && isToySizeId(r.size))
      .map((r) => ({
        type: "toy" as const,
        childName: r.itemChildName.trim(),
        itemName: r.name.trim(),
        color: r.color.trim(),
        size: r.size as ToySizeId,
      }));
  }

  if (journeyType === "pacifier_weaning") {
    const parsed = Number.parseInt(pacifierQuantity.trim(), 10);
    const q = Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
    return [
      {
        type: "pacifier" as const,
        childName: childName.trim(),
        quantity: q,
      },
    ];
  }

  if (journeyType === "bottle_weaning" && (bottleSubChoice === "bottles" || bottleSubChoice === "formula")) {
    return [
      {
        type: "bottles_formula" as const,
        subType: bottleSubChoice,
        ...(bottleSubChoice === "formula"
          ? { note: "איסוף רק פורמולות סגורות ובתוקף" as const }
          : {}),
      },
    ];
  }

  if (journeyType === "diaper_weaning" && diaperPackageType) {
    return [{ type: "diapers" as const, status: diaperPackageType }];
  }

  return [];
}

/** תיאור טקסטואלי לעמודת toy_description (legacy) */
export function formatCheckoutToyItemsDescription(items: DonationToyItemJson[]): string {
  if (items.length === 0) return "";
  return items
    .map((i) => {
      if (i.type === "toy") {
        const base = `${i.itemName} · ${i.color} · ${toySizeLabel(i.size)}`;
        return i.childName.trim() ? `${base} (ילד/ה: ${i.childName.trim()})` : base;
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

/** פרמטרים ל־URL מהבית — ?journey= */
export function pickupUrlWithJourney(journeyId: DonationJourneyId): string {
  return `/pickup?journey=${encodeURIComponent(journeyId)}`;
}

export function journeyFromSearchParam(raw: string | null | undefined): DonationJourneyId | null {
  if (!raw || !isDonationJourneyId(raw)) return null;
  return raw;
}

/** שורות תצוגה לסיכום טופס */
export function summaryLinesFromFormInput(input: CheckoutItemsFormInput): string[] {
  const rows = buildCheckoutToyItemsJson(input) as DonationToyItemJson[];
  return rows.map((i) => {
    if (i.type === "toy" && i.childName.trim()) {
      return `${i.childName.trim()}: ${i.itemName} · ${i.color} · ${toySizeLabel(i.size)}`;
    }
    if (i.type === "toy") {
      return `${i.itemName} · ${i.color} · ${toySizeLabel(i.size)}`;
    }
    if (i.type === "pacifier") {
      const who = i.childName.trim() ? `${i.childName.trim()} · ` : "";
      return `${who}מוצצים · כמות ${i.quantity}`;
    }
    if (i.type === "bottles_formula") {
      return i.subType === "formula" ? "פורמולה" : "בקבוקים";
    }
    if (i.type === "diapers") {
      return `חיתולים · ${i.status}`;
    }
    return "";
  });
}
