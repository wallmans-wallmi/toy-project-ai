import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { pickupUrlWithJourney } from "@/lib/donation-checkout-items";
import { DONATION_JOURNEY_EMOJI } from "@/lib/donation-journey";
import { cn } from "@/lib/utils";

function HeroJourneyPanel() {
  return (
    <div className="relative mx-auto w-full">
      <div
        className="absolute -top-3 z-10 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-[0_10px_32px_rgba(147,51,234,0.14),0_3px_12px_rgba(31,41,55,0.08)] end-3 sm:text-sm"
        role="status"
      >
        3 איסופים היום 🚗
      </div>
      <div
        className="absolute -bottom-1 z-10 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-[0_10px_32px_rgba(147,51,234,0.14),0_3px_12px_rgba(31,41,55,0.08)] start-3 sm:-bottom-2 sm:text-sm"
        role="status"
      >
        מכתב חדש נשלח ✉️
      </div>

      <div className="rounded-3xl bg-white p-4 pt-9 sm:p-5 sm:pt-10">
        <Link
          href={pickupUrlWithJourney()}
          className={cn(
            "flex min-h-[120px] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-[#9333EA]/25 bg-[#ede9fe] p-5 text-center transition-transform hover:-translate-y-0.5 sm:min-h-[140px]",
          )}
        >
          <span className="journey-emoji-slot journey-emoji-slot--md" aria-hidden>
            {DONATION_JOURNEY_EMOJI.toy_dropoff}
          </span>
          <span className="text-base font-bold leading-tight text-slate-900 sm:text-lg">תרומת צעצועים</span>
          <span className="text-sm font-medium leading-snug text-slate-600 sm:text-base">איסוף עד הבית ומכתב חם לילד</span>
        </Link>

        <div className="mt-4 rounded-2xl border-2 border-[#9333EA]/30 bg-gradient-to-br from-violet-50 to-white px-4 py-4 sm:mt-5 sm:px-5">
          <p className="flex flex-wrap items-center justify-center gap-2 text-center text-sm font-bold text-[#9333EA] sm:text-base">
            <span aria-hidden>✨</span>
            מכתב השבוע מהלב הדיגיטלי
            <span aria-hidden>✉️</span>
          </p>
          <p className="mt-3 text-pretty text-center text-xs italic leading-relaxed text-slate-600 sm:text-sm">
            היי חבר שלי, הגיע אליי הדובי הרך שלך והוא כבר יושב אצלי על המיטה, תודה על החיבוק שהבאת איתו נשיקות מהחברה
            החדשה שלך
          </p>
        </div>
      </div>
    </div>
  );
}

export function HomeLanding() {
  return (
    <div className="w-full">
      <section className="relative overflow-hidden border-b border-violet-100/60 bg-gradient-to-b from-[#F9F5FF] via-white to-[#F9F5FF]/80 pb-12 pt-4 sm:pb-14 sm:pt-5">
        <div
          className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_80%_0%,rgba(147,51,234,0.07),transparent_50%),radial-gradient(ellipse_at_20%_100%,rgba(253,224,71,0.1),transparent_45%)]"
          aria-hidden
        />

        <div className="relative z-10 mx-auto w-full max-w-[500px] px-4 sm:px-5">
          <div className="flex flex-col gap-10">
            <div className="flex flex-col text-start">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200/90 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-900 sm:text-sm">
                <span aria-hidden>🌱</span>
                +2,400 צעצועים מצאו בית חדש
              </div>

              <h1 className="font-display mt-5 text-pretty text-3xl font-bold leading-snug tracking-tight sm:text-4xl">
                <span className="block text-[#111827]">נפרדים מהישן</span>
                <span
                  className={cn(
                    "mt-1 block bg-gradient-to-r from-[#9333EA] to-[#ec4899]",
                    "bg-clip-text text-transparent [-webkit-background-clip:text] [-webkit-text-fill-color:transparent]",
                  )}
                >
                  וממשיכים לצמוח בחיוך
                </span>
              </h1>

              <p className="mt-5 text-pretty text-sm leading-relaxed text-slate-600 sm:text-base">
                השירות שלנו מתמקד בתרומת צעצועים בלבד: איסוף נוח, טיפול בפריטים, ומכתב חם לילד אחרי שמצאו בית חדש
                לצעצועים
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-4">
                <Link
                  href="/pickup"
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "h-12 min-h-[52px] rounded-2xl bg-[#9333EA] px-8 text-base font-bold text-white hover:bg-[#7c3aed]",
                  )}
                >
                  קבעו איסוף
                </Link>
                <Link
                  href="/services"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#9333EA] underline-offset-4 hover:underline sm:text-base"
                >
                  איך זה עובד
                  <span aria-hidden className="text-lg font-normal leading-none">
                    ←
                  </span>
                </Link>
              </div>

              <div className="mt-9 grid grid-cols-3 divide-x divide-slate-200/90 border-t border-slate-200/90 pt-6">
                <div className="flex flex-col px-2 text-start sm:px-3">
                  <p className="text-lg font-bold tabular-nums text-slate-900 sm:text-xl">2,417</p>
                  <p className="mt-1 text-xs font-medium text-slate-500 sm:text-sm">צעצועים נתרמו</p>
                </div>
                <div className="flex flex-col px-2 text-start sm:px-3">
                  <p className="text-lg font-bold tabular-nums text-slate-900 sm:text-xl">1,890</p>
                  <p className="mt-1 text-xs font-medium text-slate-500 sm:text-sm">ילדים שמחו</p>
                </div>
                <div className="flex flex-col px-2 text-start sm:px-3">
                  <p className="text-lg font-bold tabular-nums text-[#9333EA] sm:text-xl">100%</p>
                  <p className="mt-1 text-xs font-medium text-slate-500 sm:text-sm">חינם קל מאהבה</p>
                </div>
              </div>
            </div>

            <div className="w-full">
              <HeroJourneyPanel />
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-[500px] px-4 pb-14 pt-10 sm:px-5">
        <section className="mt-2" id="stories" aria-labelledby="journeys-heading">
          <h2 id="journeys-heading" className="text-base font-bold text-slate-900">
            תרומת צעצועים
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            ממלאים טופס קצר: ערכות אריזה לפי ילדים, פרטי חשבון וכתובת, וממשיכים עד התשלום המאובטח
          </p>
          <ul className="mt-5 flex flex-col gap-3">
            <li>
              <Link
                href={pickupUrlWithJourney()}
                className="flex min-h-[52px] items-center gap-3 rounded-2xl border-2 border-slate-200/90 bg-white p-4 ps-4 pe-4 transition-colors hover:border-[#9333EA] hover:bg-violet-50/60"
              >
                <span
                  className="journey-emoji-slot journey-emoji-slot--md rounded-xl bg-violet-100"
                  aria-hidden
                >
                  {DONATION_JOURNEY_EMOJI.toy_dropoff}
                </span>
                <span className="text-start text-base font-bold leading-snug text-slate-900">
                  מסירת צעצועים (מפנים מקום בבית)
                </span>
              </Link>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
