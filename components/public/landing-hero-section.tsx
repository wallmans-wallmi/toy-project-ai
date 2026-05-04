import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { PICKUP_FEE_ILS, PICKUP_FEE_LABEL } from "@/lib/constants/pricing";
import { cn } from "@/lib/utils";
import { HeroVisualPanel } from "@/components/public/hero-visual-panel";

const stats = [
  { value: "2,417", label: "פריטים נתרמו" },
  { value: "1,890", label: "ילדים שמחו" },
  { value: `₪${PICKUP_FEE_ILS}`, label: "שינוע · איסוף · מכתב AI" },
];

export function LandingHeroSection() {
  return (
    <section className="relative overflow-hidden px-4 pb-16 pt-8 sm:px-6 sm:pb-24 sm:pt-12">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_0%_0%,rgba(243,232,255,0.55),transparent_45%),radial-gradient(ellipse_at_100%_100%,rgba(236,253,245,0.6),transparent_40%)]"
        aria-hidden
      />
      <div className="relative mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="space-y-8 text-center lg:text-start">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/90 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-800">
            <span aria-hidden>🍃</span>
            2,400+ צעצועים מצאו בית חדש
          </div>
          <div className="space-y-4">
            <h1 className="text-balance text-4xl font-bold leading-tight text-slate-900 sm:text-5xl">
              כשצעצוע אחד נרדם,
              <span className="mt-1 block bg-gradient-to-l from-violet-600 via-fuchsia-500 to-violet-500 bg-clip-text text-transparent">
                ילד אחר מתעורר לחיוך
              </span>
            </h1>
            <p className="mx-auto max-w-xl text-pretty text-lg leading-relaxed text-slate-600 lg:mx-0">
              תרמו את הצעצועים שילדיכם גדלו מהם: אנחנו נאסוף, ננקה, ונשלח מכתב קסום מ&quot;חבר
              חדש&quot; לילד שמקבל אותם. {PICKUP_FEE_LABEL}. התשלום מכסה את כל הלוגיסטיקה ואת מכתב
              ה-AI המותאם אישית.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 lg:justify-start">
            <Link
              href="/pickup"
              className={cn(
                buttonVariants({ size: "lg" }),
                "h-auto min-h-11 flex-col gap-0.5 rounded-full bg-[#a855f7] px-8 py-2.5 text-base hover:bg-[#9333ea]",
              )}
            >
              <span className="flex items-center gap-1.5">
                <span aria-hidden>📦</span>
                קבעו תיאום איסוף
              </span>
              <span className="text-xs font-normal opacity-95">{PICKUP_FEE_LABEL}</span>
            </Link>
            <Link
              href="/#how-it-works"
              className="text-base font-medium text-slate-700 underline-offset-4 transition-colors hover:text-[#a855f7] hover:underline"
            >
              איך זה עובד? ←
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-4 border-t border-slate-200/80 pt-8 text-center sm:gap-6 lg:text-start">
            {stats.map((row) => (
              <div key={row.label}>
                <p className="text-xl font-bold text-slate-900 sm:text-2xl">{row.value}</p>
                <p className="text-xs font-medium text-slate-500 sm:text-sm">{row.label}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-8">
          <HeroVisualPanel />
        </div>
      </div>
    </section>
  );
}
