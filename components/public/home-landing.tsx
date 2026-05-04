import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import type { DonationJourneyId } from "@/lib/donation-journey";
import { DONATION_JOURNEY_EMOJI, DONATION_JOURNEY_OPTIONS } from "@/lib/donation-journey";
import { cn } from "@/lib/utils";

/** סדר RTL ברשת 2×2: צעצועים ימין למעלה, מוצץ שמאל למעלה, חיתול ימין למטה, בקבוק שמאל למטה */
const heroJourneyCards: {
  id: DonationJourneyId;
  title: string;
  subtitle: string;
  bg: string;
}[] = [
  {
    id: "toy_dropoff",
    title: "מסירת צעצועים",
    subtitle: "מפנים מקום בבית",
    bg: "bg-[#ede9fe]",
  },
  {
    id: "pacifier_weaning",
    title: "נפרדים מהמוצץ",
    subtitle: "גמילה מהמוצץ",
    bg: "bg-[#d8f5e8]",
  },
  {
    id: "diaper_weaning",
    title: "נפרדים מהחיתול",
    subtitle: "גמילה מחיתולים",
    bg: "bg-[#fef3c7]",
  },
  {
    id: "bottle_weaning",
    title: "נפרדים מהבקבוק",
    subtitle: "גמילה מבקבוק",
    bg: "bg-[#ffe4e1]",
  },
];

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
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
          {heroJourneyCards.map((card) => (
            <Link
              key={card.id}
              href={`/services#${card.id}`}
              className={cn(
                "flex min-h-[108px] flex-col items-center justify-center gap-1 rounded-2xl p-3 text-center transition-transform hover:-translate-y-0.5 sm:min-h-[120px] sm:p-4",
                card.bg,
              )}
            >
              <span className="journey-emoji-slot journey-emoji-slot--md" aria-hidden>
                {DONATION_JOURNEY_EMOJI[card.id]}
              </span>
              <span className="text-sm font-bold leading-tight text-slate-900 sm:text-base">{card.title}</span>
              <span className="text-xs font-medium leading-snug text-slate-600 sm:text-sm">{card.subtitle}</span>
            </Link>
          ))}
        </div>

        <div className="mt-4 rounded-2xl border-2 border-[#9333EA]/30 bg-gradient-to-br from-violet-50 to-white px-4 py-4 sm:mt-5 sm:px-5">
          <p className="flex flex-wrap items-center justify-center gap-2 text-center text-sm font-bold text-[#9333EA] sm:text-base">
            <span aria-hidden>✨</span>
            מכתב השבוע מהלב הדיגיטלי
            <span aria-hidden>✉️</span>
          </p>
          <p className="mt-3 text-pretty text-center text-xs italic leading-relaxed text-slate-600 sm:text-sm">
            היי קטנה שלי, הגיע אליי הבקבוק הורוד שלך והוא כבר מחכה לי לפני השינה, תודה על החיבוק הרך שהבאת איתו נשיקות
            מהחברה החדשה שלך
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
                +2,400 חפצים מצאו בית חדש
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
                הדרך המעצימה למסור חפצים שעבר זמנם ולהפוך כל שלב גדילה לרגע של גאווה עבור הילדים שלכם
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
                  <p className="mt-1 text-xs font-medium text-slate-500 sm:text-sm">פריטים נתרמו</p>
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
            בוחרים את המסלול שלכם
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            לחיצה על כרטיס תפתח הסבר מלא, ומשם אפשר להמשיך ישר להזמנת איסוף
          </p>
          <ul className="mt-5 flex flex-col gap-3">
            {DONATION_JOURNEY_OPTIONS.map((opt) => (
              <li key={opt.id}>
                <Link
                  href={`/services#${opt.id}`}
                  className="flex min-h-[52px] items-center gap-3 rounded-2xl border-2 border-slate-200/90 bg-white p-4 ps-4 pe-4 transition-colors hover:border-[#9333EA] hover:bg-violet-50/60"
                >
                  <span
                    className="journey-emoji-slot journey-emoji-slot--md rounded-xl bg-violet-100"
                    aria-hidden
                  >
                    {DONATION_JOURNEY_EMOJI[opt.id]}
                  </span>
                  <span className="text-start text-base font-bold leading-snug text-slate-900">{opt.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
