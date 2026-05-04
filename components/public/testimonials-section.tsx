import { TestimonialCard } from "@/components/public/testimonial-card";

const items = [
  {
    quote:
      "הבן שלי בכה כשנפרד מהדוב. אבל כשקיבל את התמונה של הילד שמחזיק אותו: החיוך שלו היה שווה הכל.",
    authorName: "נועה כהן",
    authorDetail: "אמא לשניים, תל אביב",
    avatarEmoji: "👩",
    avatarClassName: "bg-amber-100",
  },
  {
    quote:
      "המכתב של ה-AI היה כל כך אנושי ומרגש: ילדתי ביקשה לשמוע אותו שלוש פעמים לפני השינה. מדהים!",
    authorName: "אלון לוי",
    authorDetail: "אב לבת אחת, ירושלים",
    avatarEmoji: "👨",
    avatarClassName: "bg-emerald-100",
  },
  {
    quote:
      "תרמנו שקית שלמה של צעצועים. השליח היה כל כך נחמד, האיסוף לקח 10 דקות. ממליצה בחום לכולם!",
    authorName: "מיכל ברק",
    authorDetail: "אמא לשלושה, חיפה",
    avatarEmoji: "👩",
    avatarClassName: "bg-orange-100",
  },
];

export function TestimonialsSection() {
  return (
    <section
      id="testimonials"
      className="relative scroll-mt-24 overflow-hidden px-4 py-16 sm:px-6 sm:py-24"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-violet-50/90 via-amber-50/40 to-emerald-50/70"
        aria-hidden
      />
      <div className="relative mx-auto max-w-6xl space-y-12 text-center">
        <header className="mx-auto max-w-3xl space-y-3">
          <p className="text-sm font-semibold text-[#a855f7]">מה אומרים עלינו</p>
          <h2 className="text-balance text-3xl font-bold text-slate-900 sm:text-4xl">
            אלפי משפחות כבר חייכו
          </h2>
        </header>
        <div className="grid gap-8 md:grid-cols-3">
          {items.map((t) => (
            <TestimonialCard key={t.authorName} {...t} />
          ))}
        </div>
      </div>
    </section>
  );
}
