import type { Metadata } from "next";
import { DonationForm } from "@/components/public/donation-form";
import { PickupPageIntro } from "@/components/public/pickup-page-intro";

export const metadata: Metadata = {
  title: "תיאום איסוף",
  description: "תיאום נוח לתרומת צעצועים, כמה שלבים פשוטים ובלי לחץ",
};

export default function PickupPage() {
  return (
    <div className="pickup-flow-main animate-pickup-page-enter mx-auto flex min-h-[100dvh] w-full max-w-[500px] flex-col px-4 pb-12 pt-6">
      <PickupPageIntro />
      <DonationForm variant="pickupPage" />
    </div>
  );
}
