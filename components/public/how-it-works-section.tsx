import { StepCard } from "@/components/public/step-card";
import { PICKUP_FEE_ILS } from "@/lib/constants/pricing";

const steps = [
  {
    stepNumber: 1,
    accent: "purple" as const,
    icon: "📦",
    title: "אתם תורמים",
    description:
      `בחרו את הצעצועים שגדלתם מהם, מלאו טופס קצר, ובתשלום דמי שינוע ואיסוף (₪${PICKUP_FEE_ILS}) שכוללים גם את מכתב ה-AI. אנחנו קובעים איסוף עד הבית ביום המתאים לאזור שלכם.`,
  },
  {
    stepNumber: 2,
    accent: "mint" as const,
    icon: "🚗",
    title: "אנחנו אוספים",
    description:
      'שליח מטעמנו מגיע, בודק שהכל בסדר, מנקה ומכין את הצעצועים להיות "חדשים" עבור מישהו אחר.',
  },
  {
    stepNumber: 3,
    accent: "orange" as const,
    icon: "✉️",
    title: "הילד מקבל מכתב",
    description:
      'הצעצוע מגיע עם מכתב מרגש שכתב ה-AI "מנקודת מבט הצעצוע": ילדים מקבלים חבר חדש, ומשפחתכם מקבלת תמונה.',
  },
];

function ArrowDivider() {
  return (
    <div className="hidden items-center justify-center md:flex" aria-hidden>
      <span className="text-2xl font-light text-violet-300">←</span>
    </div>
  );
}

export function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="relative scroll-mt-24 overflow-hidden px-4 py-16 sm:px-6 sm:py-24"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,rgba(243,232,255,0.9),transparent_50%),radial-gradient(ellipse_at_20%_80%,rgba(236,253,245,0.85),transparent_45%),radial-gradient(ellipse_at_50%_50%,rgba(254,249,231,0.5),transparent_55%)]"
        aria-hidden
      />
      <div className="relative mx-auto max-w-6xl space-y-12 text-center">
        <header className="mx-auto max-w-3xl space-y-4">
          <p className="text-sm font-semibold text-[#a855f7]">התהליך</p>
          <h2 className="text-balance text-3xl font-bold text-slate-900 sm:text-4xl">
            שלושה צעדים, אינסוף חיוכים
          </h2>
          <p className="text-pretty text-base leading-relaxed text-slate-600 sm:text-lg">
            פשוט, שקוף במחיר, ומלא לב. דמי שינוע ואיסוף: ₪{PICKUP_FEE_ILS}, כולל לוגיסטיקה ומכתב AI מותאם.
          </p>
        </header>
        <div className="grid gap-8 md:grid-cols-[1fr_auto_1fr_auto_1fr] md:items-stretch">
          <StepCard
            stepNumber={steps[0].stepNumber}
            accent={steps[0].accent}
            icon={steps[0].icon}
            title={steps[0].title}
            description={steps[0].description}
            className="text-start"
          />
          <ArrowDivider />
          <StepCard
            stepNumber={steps[1].stepNumber}
            accent={steps[1].accent}
            icon={steps[1].icon}
            title={steps[1].title}
            description={steps[1].description}
            className="text-start"
          />
          <ArrowDivider />
          <StepCard
            stepNumber={steps[2].stepNumber}
            accent={steps[2].accent}
            icon={steps[2].icon}
            title={steps[2].title}
            description={steps[2].description}
            className="text-start"
          />
        </div>
      </div>
    </section>
  );
}
