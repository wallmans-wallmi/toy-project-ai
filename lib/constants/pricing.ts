/** מחיר דמי שינוע ואיסוף בשקלים חדשים */
export const PICKUP_FEE_ILS = 49;

/** מחיר לשקית אריזה נוספת (מעבר לשקית הכלולה לכל ילד או ילדה) */
export const EXTRA_BAG_FEE_ILS = 15;

/** טקסט תצוגה אחיד למחיר השינוע והאיסוף */
export const PICKUP_FEE_LABEL = "דמי שינוע ואיסוף: ₪49";

/** סכום לתשלום: בסיס + שקיות נוספות */
export function pickupCheckoutTotalIls(extraBagsTotal: number): number {
  const extra = Math.max(0, Math.min(80, Math.floor(extraBagsTotal)));
  return PICKUP_FEE_ILS + extra * EXTRA_BAG_FEE_ILS;
}

/** סכום לחיוב ב-Stripe (אגורות) לפי סה״כ שקיות נוספות */
export function pickupCheckoutTotalAgorot(extraBagsTotal: number): number {
  return pickupCheckoutTotalIls(extraBagsTotal) * 100;
}

/** סכום לחיוב ב-Stripe (אגורות) */
export const PICKUP_FEE_AGOROT = PICKUP_FEE_ILS * 100;
