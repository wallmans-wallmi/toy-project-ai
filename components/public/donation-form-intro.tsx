import { Camera, Lock, Sparkles } from "lucide-react";
import { PICKUP_FEE_ILS, PICKUP_FEE_LABEL } from "@/lib/constants/pricing";

const features = [
  {
    icon: Lock,
    iconClass: "bg-violet-100 text-violet-700",
    title: "פרטיות מלאה",
    body: "הפרטים שלכם מאובטחים ולא עוברים לשום גורם שלישי.",
  },
  {
    icon: Sparkles,
    iconClass: "bg-emerald-100 text-emerald-700",
    title: PICKUP_FEE_LABEL,
    body: "התשלום מכסה שינוע ואיסוף עד הבית, והכנת מכתב ה-AI החם והמותאם אישית לילד המקבל.",
  },
  {
    icon: Camera,
    iconClass: "bg-amber-100 text-amber-700",
    title: "תקבלו עדכון ותמונה",
    body: "כשהצעצוע מגיע לבית החדש שלו: נשתף אתכם.",
  },
];

export function DonationFormIntro() {
  return (
    <div className="space-y-8 text-center lg:text-start">
      <div className="space-y-3">
        <p className="text-sm font-semibold text-[#a855f7]">תיאום איסוף</p>
        <h2 className="text-balance text-3xl font-bold text-slate-900 sm:text-4xl">
          מוכנים לשמח מישהו?
        </h2>
        <p className="text-pretty text-lg text-slate-600">
          ממלאים, משלמים ₪{PICKUP_FEE_ILS} לדמי שינוע ואיסוף, ואנחנו מגיעים. המחיר משקף את הלוגיסטיקה
          ואת עבודת ה-AI על המכתב האישי.
        </p>
      </div>
      <ul className="flex flex-col gap-6 text-start">
        {features.map((item) => (
          <li key={item.title} className="flex gap-4">
            <span
              className={`flex size-11 shrink-0 items-center justify-center rounded-2xl ${item.iconClass}`}
              aria-hidden
            >
              <item.icon className="size-5" strokeWidth={2} />
            </span>
            <div className="space-y-1">
              <p className="font-semibold text-slate-900">{item.title}</p>
              <p className="text-sm leading-relaxed text-slate-600">{item.body}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
