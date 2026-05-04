const toyCells = [
  { bg: "bg-amber-100", emoji: "🎨" },
  { bg: "bg-emerald-100", emoji: "🚂" },
  { bg: "bg-violet-100", emoji: "🧸" },
  { bg: "bg-orange-100", emoji: "🎭" },
  { bg: "bg-sky-100", emoji: "🧩" },
  { bg: "bg-pink-100", emoji: "🪀" },
];

export function HeroVisualPanel() {
  return (
    <div className="relative mx-auto w-full max-w-md lg:max-w-none">
      <div
        className="absolute -top-2 z-10 whitespace-nowrap rounded-full bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-[0_10px_32px_rgba(147,51,234,0.14),0_3px_12px_rgba(31,41,55,0.08)] end-0 sm:-end-4 sm:text-sm"
        role="status"
      >
        🚗 3 איסופים היום
      </div>
      <div
        className="absolute -bottom-1 z-10 whitespace-nowrap rounded-full bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-[0_10px_32px_rgba(147,51,234,0.14),0_3px_12px_rgba(31,41,55,0.08)] start-0 sm:-start-6 sm:text-sm"
        role="status"
      >
        ✉️ מכתב חדש נשלח
      </div>
      <div className="rounded-[2rem] bg-white p-6 sm:p-8">
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          {toyCells.map((cell) => (
            <div
              key={cell.emoji}
              className={`flex aspect-square items-center justify-center rounded-2xl text-3xl sm:text-4xl ${cell.bg}`}
            >
              <span aria-hidden>{cell.emoji}</span>
            </div>
          ))}
        </div>
        <div className="mt-6 space-y-2">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 sm:text-sm">
            <span className="text-[#a855f7]">✓ 68%</span>
            <span>יעד חודשי</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full w-[68%] rounded-full bg-gradient-to-l from-violet-500 to-fuchsia-500"
              role="progressbar"
              aria-valuenow={68}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>
        <div className="mt-6 rounded-2xl bg-violet-50/90 p-4 text-start sm:p-5">
          <p className="flex items-center gap-2 text-sm font-semibold text-violet-900">
            <span aria-hidden>✉️</span>
            מכתב השבוע מ-AI
          </p>
          <p className="mt-2 text-sm italic leading-relaxed text-slate-600">
            שלום! שמי מיה, ואני כל כך שמחה שהדוב הקטן שלך הגיע אלי. כל לילה אני חובקת אותו
            ומרגישה שאת שולחת לי חיבוק...
          </p>
        </div>
      </div>
    </div>
  );
}
