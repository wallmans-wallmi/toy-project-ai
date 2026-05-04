import { DonationFormIntro } from "@/components/public/donation-form-intro";
import { DonationForm } from "@/components/public/donation-form";

export function PickupScheduleSection() {
  return (
    <section
      id="pickup"
      className="relative scroll-mt-24 overflow-hidden px-4 py-16 sm:px-6 sm:py-24"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_30%,rgba(243,232,255,0.7),transparent_50%),radial-gradient(ellipse_at_70%_60%,rgba(236,253,245,0.65),transparent_45%),radial-gradient(ellipse_at_50%_100%,rgba(254,249,231,0.45),transparent_50%)]"
        aria-hidden
      />
      <div className="relative mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:items-start lg:gap-16">
        <DonationFormIntro />
        <div className="mx-auto w-full max-w-[500px]">
          <DonationForm />
        </div>
      </div>
    </section>
  );
}
