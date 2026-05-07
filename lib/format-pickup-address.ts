import type { DonationFormState } from "@/hooks/use-donation-form";

/** שורת כתובת אחת לעמודת address במסד (לפני קוד כניסה נפרד) */
export function formatPickupAddressLine(form: DonationFormState): string {
  const street = form.streetName.trim();
  const house = form.houseNumber.trim();
  const apt = form.apartmentNumber.trim();
  const floor = form.floor.trim();
  const core = `${street} ${house}`.trim();
  if (!core) return "";
  const extra: string[] = [];
  if (apt) extra.push(`דירה ${apt}`);
  if (floor) extra.push(`קומה ${floor}`);
  return extra.length ? `${core} ${extra.join(" ")}`.trim() : core;
}

/** עיר + רחוב ומספר (לסיכום טופס, בלי קוד כניסה ובלי הערות) */
export function formatPickupCityAndStreetLine(form: DonationFormState): string {
  const city = form.pickupCity.trim();
  const streetBlock = formatPickupAddressLine(form);
  if (city && streetBlock) return `${city}, ${streetBlock}`;
  if (city) return city;
  return streetBlock;
}
