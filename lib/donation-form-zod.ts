import type { DonationFormState } from "@/hooks/use-donation-form";
import { isToyDropoffJourney } from "@/lib/donation-journey";
import { isToySizeId } from "@/lib/toy-donation";
import { z } from "zod";

const toyRowSchema = z.object({
  itemChildName: z.string().trim().min(1, "שם הילד/ה לפריט"),
  name: z.string().trim().min(1),
  color: z.string().trim().min(1),
  size: z.enum(["small", "medium", "large"]),
});

export function journeyItemsStepValid(form: DonationFormState): boolean {
  if (!isToyDropoffJourney(form.journeyType)) return false;

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
    const touched = Boolean(r.itemChildName.trim() || r.name.trim() || r.color.trim() || r.size);
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
