import { PICKUP_FEE_LABEL } from "@/lib/constants/pricing";

export function PickupPageIntro() {
  return (
    <header className="mb-6 text-center">
      <p className="text-sm font-semibold text-[#9333EA]">תיאום איסוף</p>
      <h1 className="mt-2 text-balance text-2xl font-bold text-slate-900">תיאום איסוף נוח וברור</h1>
      <p className="mt-2 text-pretty text-base leading-relaxed text-slate-600">
        ממלאים את הפרטים בטופס ואנחנו מטפלים בהמשך {PICKUP_FEE_LABEL}, כולל שינוע ומכתב AI לילד המקבל
      </p>
    </header>
  );
}
