import Link from "next/link";
import type { Metadata } from "next";
import { buttonVariants } from "@/components/ui/button";
import { pickupUrlWithJourney } from "@/lib/donation-checkout-items";
import { DONATION_JOURNEY_OPTIONS } from "@/lib/donation-journey";
import { JOURNEY_SERVICE_SECTIONS, SERVICES_INTRO } from "@/lib/services-page-content";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "שירותים",
  description:
    "מסלולי תרומה וגמילה עם איסוף עד הבית, טיפול מכבד בפריטים ומכתב חם מותאם למשפחה המקבלת",
};

export default function ServicesPage() {
  return (
    <div className="mx-auto w-full max-w-[500px] px-4 pb-16 pt-6 sm:px-5">
      <header
        id="about"
        className="scroll-mt-28 rounded-3xl border border-violet-100/90 bg-white/90 px-5 py-7 sm:px-6"
      >
        <h1 className="text-balance text-2xl font-bold leading-snug text-slate-900">השירותים שלנו</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          כאן תמצאו את ארבעת המסלולים שאנחנו מלווים בהם משפחות כמוכם בדרך חמה ובטוחה
        </p>
      </header>

      <section className="mt-8 rounded-3xl border-2 border-[#9333EA]/25 bg-gradient-to-br from-violet-50/90 to-white px-5 py-6 sm:px-6" aria-labelledby="gift-heading">
        <h2 id="gift-heading" className="text-base font-bold text-slate-900">
          {SERVICES_INTRO.title}
        </h2>
        <p className="mt-3 text-sm font-medium leading-relaxed text-slate-800">{SERVICES_INTRO.giftHighlight}</p>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">{SERVICES_INTRO.supporting}</p>
      </section>

      <div className="mt-10 flex flex-col gap-10">
        {DONATION_JOURNEY_OPTIONS.map((opt) => {
          const detail = JOURNEY_SERVICE_SECTIONS[opt.id];
          return (
            <section
              key={opt.id}
              id={opt.id}
              className="scroll-mt-24 rounded-3xl border border-violet-100 bg-white/95 px-5 py-6 sm:px-6"
              aria-labelledby={`${opt.id}-title`}
            >
              <h2 id={`${opt.id}-title`} className="text-base font-bold leading-snug text-slate-900">
                {detail.headline}
              </h2>
              <ul className="mt-4 space-y-3 text-sm leading-relaxed text-slate-600">
                {detail.bullets.map((line) => (
                  <li key={line} className="flex gap-2">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[#9333EA]" aria-hidden />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-5">
                <Link
                  href={pickupUrlWithJourney(opt.id)}
                  className={cn(
                    buttonVariants({ size: "sm" }),
                    "inline-flex rounded-xl bg-[#9333EA] px-4 py-2 text-sm font-bold text-white hover:bg-[#7c3aed]",
                  )}
                >
                  הזמנת איסוף במסלול הזה
                </Link>
              </div>
            </section>
          );
        })}
      </div>

      <div className="mt-12 rounded-2xl bg-[#9333EA] px-5 py-6 text-center">
        <p className="text-base font-bold text-white">מוכנים להזמין איסוף</p>
        <p className="mt-2 text-sm leading-relaxed text-violet-100">
          בוחרים מסלול בטופס וממשיכים בקלות עד התשלום המאובטח
        </p>
        <Link
          href="/pickup"
          className={cn(
            buttonVariants({ size: "lg" }),
            "mt-5 inline-flex h-11 min-w-[200px] rounded-2xl bg-white text-sm font-bold text-[#9333EA] hover:bg-violet-50",
          )}
        >
          הזמנת איסוף
        </Link>
      </div>
    </div>
  );
}
