import type { RegionId } from "@/lib/pickup-regions";

export type IsraeliCity = {
  name: string;
  regionId: RegionId;
};

/** ערים לדוגמה למיפוי לאזורי איסוף פעילים (תל אביב / ראשון) */
export const ISRAELI_CITIES: IsraeliCity[] = [
  { name: "תל אביב — יפו", regionId: "tel_aviv" },
  { name: "רמת גן", regionId: "tel_aviv" },
  { name: "גבעתיים", regionId: "tel_aviv" },
  { name: "בני ברק", regionId: "tel_aviv" },
  { name: "הרצליה", regionId: "tel_aviv" },
  { name: "רעננה", regionId: "tel_aviv" },
  { name: "כפר סבא", regionId: "tel_aviv" },
  { name: "הוד השרון", regionId: "tel_aviv" },
  { name: "רמת השרון", regionId: "tel_aviv" },
  { name: "פתח תקווה", regionId: "tel_aviv" },
  { name: "קריית אונו", regionId: "tel_aviv" },
  { name: "אור יהודה", regionId: "tel_aviv" },
  { name: "יהוד — מונוסון", regionId: "tel_aviv" },
  { name: "חולון", regionId: "tel_aviv" },
  { name: "בת ים", regionId: "tel_aviv" },
  { name: "ראשון לציון", regionId: "rishon_lezion" },
  { name: "נס ציונה", regionId: "rishon_lezion" },
  { name: "רחובות", regionId: "rishon_lezion" },
  { name: "יבנה", regionId: "rishon_lezion" },
  { name: "גדרה", regionId: "rishon_lezion" },
  { name: "באר יעקב", regionId: "rishon_lezion" },
  { name: "לוד", regionId: "rishon_lezion" },
  { name: "רמלה", regionId: "rishon_lezion" },
  { name: "מודיעין — מכבים — רעות", regionId: "rishon_lezion" },
  { name: "ירושלים", regionId: "tel_aviv" },
  { name: "חיפה", regionId: "tel_aviv" },
  { name: "קריות", regionId: "tel_aviv" },
  { name: "נתניה", regionId: "tel_aviv" },
  { name: "חדרה", regionId: "tel_aviv" },
  { name: "אשדוד", regionId: "rishon_lezion" },
  { name: "אשקלון", regionId: "rishon_lezion" },
  { name: "קריית גת", regionId: "rishon_lezion" },
  { name: "באר שבע", regionId: "rishon_lezion" },
  { name: "דימונה", regionId: "rishon_lezion" },
  { name: "נצרת", regionId: "tel_aviv" },
  { name: "עפולה", regionId: "tel_aviv" },
  { name: "טבריה", regionId: "tel_aviv" },
  { name: "כרמיאל", regionId: "tel_aviv" },
  { name: "נהריה", regionId: "tel_aviv" },
  { name: "צפת", regionId: "tel_aviv" },
];
