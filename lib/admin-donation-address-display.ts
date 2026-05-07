/** שדות כתובת לתצוגת אדמין (ללא תלות ב־hooks כדי למנוע מעגל ייבוא) */
export type AdminDonationAddressSlice = {
  pickup_address: string | null;
  pickup_location: string | null;
  address: string | null;
  pickup_city: string | null;
  street_name: string | null;
  house_number: string | null;
  apartment_number: string | null;
  floor: string | null;
  door_code?: string | null;
  address_notes?: string | null;
  pickup_notes?: string | null;
};

/** שורת רחוב מפורקת לתצוגה באדמין */
export function adminStructuredStreetLine(
  r: Pick<AdminDonationAddressSlice, "street_name" | "house_number" | "apartment_number" | "floor">,
): string {
  const sn = (r.street_name ?? "").trim();
  const hn = (r.house_number ?? "").trim();
  const apt = (r.apartment_number ?? "").trim();
  const fl = (r.floor ?? "").trim();
  const tail: string[] = [];
  if (hn) tail.push(hn);
  if (apt) tail.push(`דירה ${apt}`);
  if (fl) tail.push(`קומה ${fl}`);
  const block = [sn, tail.join(" ")].filter(Boolean).join(" ").trim();
  return block;
}

/** שאילתת ניווט: עדיפות לשורה מלאה, אחרת עיר ורחוב מפורק */
export function adminPickupMapsQuery(r: AdminDonationAddressSlice): string {
  const line = (r.pickup_address ?? r.pickup_location ?? r.address ?? "").trim();
  if (line) return line;
  const city = (r.pickup_city ?? "").trim();
  const street = adminStructuredStreetLine(r);
  if (city && street) return `${city}, ${street}`;
  return city || street;
}

/** טקסט מלא לכרטיס איסוף: עיר, רחוב, קוד, הערות לקוח, הערות אריזה */
export function adminPickupDisplayBlock(r: AdminDonationAddressSlice): string {
  const lines: string[] = [];
  const city = (r.pickup_city ?? "").trim();
  const structured = adminStructuredStreetLine(r);
  const fallback = (r.pickup_address ?? r.address ?? "").trim();
  if (city) lines.push(`עיר: ${city}`);
  if (structured) lines.push(`רחוב: ${structured}`);
  else if (fallback) lines.push(fallback);
  const dc = (r.door_code ?? "").trim();
  if (dc) lines.push(`קוד כניסה: ${dc}`);
  const an = (r.address_notes ?? "").trim();
  if (an) lines.push(`הערות לכתובת: ${an}`);
  const pn = (r.pickup_notes ?? "").trim();
  if (pn) lines.push(`הערות אריזה: ${pn}`);
  return lines.join("\n");
}
