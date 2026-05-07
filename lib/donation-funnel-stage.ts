import { isDonationPaymentCompletedValue } from "@/lib/donation-payment-status";

/** נשמר באמצע הטופס לפני מסך תשלום */
export const FUNNEL_POTENTIAL = "potential" as const;
/** נרשם במסך תשלום (או אחרי שליחה מלאה) */
export const FUNNEL_ORDERED = "ordered" as const;

export type DonationFunnelStage = typeof FUNNEL_POTENTIAL | typeof FUNNEL_ORDERED;

/** שלבי תהליך להזמנות (לא פוטנציאליים) — מסננים באדמין */
export type AdminOrderPipelineTab = "all" | "kit" | "kit_ready" | "pickup" | "letter" | "done";

export type AdminDonationRowForPipeline = {
  funnel_stage: string | null;
  payment_status: string | null;
  portal_fulfillment_stage: string | null;
  pickup_status: string | null;
  delivery_status: string | null;
  letter_status: string | null;
};

/** מיפוי שורת הזמנה לטאב תהליך (רק עבור funnel ordered) */
export function orderPipelineTab(r: AdminDonationRowForPipeline): AdminOrderPipelineTab {
  if ((r.funnel_stage ?? "").trim() === FUNNEL_POTENTIAL) return "all";

  const paid = isDonationPaymentCompletedValue(r.payment_status as string | null | undefined | boolean);
  const portal = (r.portal_fulfillment_stage ?? "").trim();
  const ps = (r.pickup_status ?? "").trim();
  const ds = (r.delivery_status ?? "").trim();
  const ls = (r.letter_status ?? "").trim();

  const letterDone = ls === "sent" || ls === "completed";
  if (letterDone && ps === "picked_up" && ds === "delivered") return "done";

  if (paid && ds === "delivered" && !letterDone) return "letter";

  /** ערכה אצל הלקוח, עדיין לא תואם איסוף (שונה מ־«ממתינים לאיסוף» אחרי שקבעו חלון) */
  if (paid && portal === "kit_delivered" && ps === "pending") return "kit_ready";

  const pickupQueuePortal =
    portal === "pickup_scheduled" || portal === "courier_en_route" || portal === "collected" || portal === "donated";
  if (paid && pickupQueuePortal && ps === "pending") return "pickup";

  if (paid && (portal === "request_received" || portal === "kit_in_transit")) return "kit";

  if (paid && ps === "picked_up" && ds !== "delivered") return "pickup";

  if (paid && letterDone === false && (ps === "picked_up" || ds === "sent_to_ngo")) return "letter";

  return "all";
}

export function orderMatchesPipelineTab(r: AdminDonationRowForPipeline, tab: AdminOrderPipelineTab): boolean {
  if (tab === "all") return true;
  return orderPipelineTab(r) === tab;
}
