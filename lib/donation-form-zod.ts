import { z } from "zod";
import type { DonationFormState } from "@/hooks/use-donation-form";
import { isDonationJourneyId, isToyDropoffJourney } from "@/lib/donation-journey";
import { isToySizeId } from "@/lib/toy-donation";

const toyRowSchema = z.object({
  itemChildName: z.string().trim().min(1, "שם הילד/ה לפריט"),
  name: z.string().trim().min(1),
  color: z.string().trim().min(1),
  size: z.enum(["small", "medium", "large"]),
});

const pacifierStepSchema = z.object({
  childName: z.string().trim().min(1),
  pacifierQuantity: z
    .string()
    .trim()
    .regex(/^\d+$/, "כמות מספרית בלבד")
    .refine((s) => {
      const n = Number.parseInt(s, 10);
      return n >= 1 && n <= 500;
    }, "כמות בין 1 ל־500"),
});

const bottleStepSchema = z.object({
  childName: z.string().trim().min(1),
  bottleSubChoice: z.enum(["bottles", "formula"]),
});

const diaperStepSchema = z.object({
  childName: z.string().trim().min(1),
  diaperPackageType: z.enum(["closed", "loose", "both"]),
});

/**
 * שלב פריטים — שדות חובה לפי מסלול בלבד.
 * אישור איכות ותנאי שירות נבדקים בשלב הסיכום, לא כאן.
 */
export function journeyItemsStepValid(form: DonationFormState): boolean {
  if (!isDonationJourneyId(form.journeyType)) return false;

  if (isToyDropoffJourney(form.journeyType)) {
    const completeRows = form.toyItems.filter(
      (r) =>
        r.itemChildName.trim() &&
        r.name.trim() &&
        r.color.trim() &&
        r.size &&
        isToySizeId(r.size),
    );
    if (completeRows.length < 1) return false;
    const partial = form.toyItems.some((r) => {
      const touched = Boolean(
        r.itemChildName.trim() || r.name.trim() || r.color.trim() || r.size,
      );
      const ok = toyRowSchema.safeParse({
        itemChildName: r.itemChildName,
        name: r.name,
        color: r.color,
        size: r.size,
      }).success;
      return touched && !ok;
    });
    return !partial;
  }

  if (form.journeyType === "pacifier_weaning") {
    return pacifierStepSchema.safeParse({
      childName: form.childName,
      pacifierQuantity: form.pacifierQuantity,
    }).success;
  }

  if (form.journeyType === "bottle_weaning") {
    if (!form.bottleSubChoice) return false;
    return bottleStepSchema.safeParse({
      childName: form.childName,
      bottleSubChoice: form.bottleSubChoice,
    }).success;
  }

  if (form.journeyType === "diaper_weaning") {
    if (!form.diaperPackageType) return false;
    return diaperStepSchema.safeParse({
      childName: form.childName,
      diaperPackageType: form.diaperPackageType,
    }).success;
  }

  return false;
}
