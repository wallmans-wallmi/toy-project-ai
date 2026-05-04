import type { Metadata } from "next";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "תשלום הושלם",
  description: "תודה! קיבלנו את התשלום וניצור איתכם קשר לתיאום סופי.",
};

export default function PickupSuccessPage({
  searchParams,
}: {
  searchParams: { session_id?: string };
}) {
  const hasSession = Boolean(searchParams.session_id);

  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center sm:px-6">
      <div className="rounded-3xl border border-violet-100 bg-white p-8">
        <p className="text-4xl" aria-hidden>
          💜
        </p>
        <h1 className="mt-4 text-2xl font-bold text-slate-900">תודה רבה!</h1>
        <p className="mt-3 text-pretty leading-relaxed text-slate-600">
          {hasSession
            ? "התשלום התקבל. שמרנו את הבקשה. ניצור איתכם קשר בקרוב כדי לאשר את סופי יום האיסוף ופרטי ההגעה."
            : "אם סיימתם תשלום, הבקשה אצלנו בטיפול. אם הגעתם לכאן בטעות, תמיד אפשר לחזור ולמלא מחדש."}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className={cn(buttonVariants({ variant: "outline" }), "rounded-full")}>
            חזרה לדף הבית
          </Link>
          <Link href="/pickup" className={cn(buttonVariants(), "rounded-full bg-[#a855f7] hover:bg-[#9333ea]")}>
            תיאום נוסף
          </Link>
        </div>
      </div>
    </div>
  );
}
