import type { Metadata } from "next";
import { DonationForm } from "@/components/public/donation-form";
import { PickupPageIntro } from "@/components/public/pickup-page-intro";
import { journeyFromSearchParam } from "@/lib/donation-checkout-items";
import type { DonationJourneyId } from "@/lib/donation-journey";

export const metadata: Metadata = {
  title: "תיאום איסוף",
  description: "תיאום נוח לתרומת צעצועים, כמה שלבים פשוטים ובלי לחץ",
};

type SearchParams = Record<string, string | string[] | undefined>;

function parseJourneyFromSearchParams(sp: SearchParams): DonationJourneyId | undefined {
  const raw = sp.journey;
  const s = typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] : undefined;
  return journeyFromSearchParam(s ?? null) ?? undefined;
}

export default async function PickupPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams> | SearchParams;
}) {
  const sp = await Promise.resolve(searchParams);
  const initialJourneyType = parseJourneyFromSearchParams(sp);

  return (
    <div className="pickup-flow-main animate-pickup-page-enter mx-auto flex min-h-[100dvh] w-full max-w-[500px] flex-col px-4 pb-12 pt-6">
      <PickupPageIntro />
      <DonationForm variant="pickupPage" initialJourneyType={initialJourneyType} />
    </div>
  );
}
