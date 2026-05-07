import type { Metadata } from "next";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { applyDonationCheckoutCompletionFromStripeSession } from "@/lib/stripe/apply-donation-checkout-completion";
import { getStripe } from "@/lib/stripe/server";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "תשלום הושלם",
  description: "תודה! קיבלנו את התשלום וניצור איתכם קשר לתיאום סופי.",
};

type SearchParams = Record<string, string | string[] | undefined>;

function firstString(v: string | string[] | undefined): string | undefined {
  if (typeof v === "string") return v;
  if (Array.isArray(v)) return v[0];
  return undefined;
}

export default async function PickupSuccessPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams> | SearchParams;
}) {
  const sp = await Promise.resolve(searchParams);
  const sessionId = firstString(sp.session_id);
  const hasSession = Boolean(sessionId);

  if (sessionId?.startsWith("cs_")) {
    try {
      const stripe = getStripe();
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      await applyDonationCheckoutCompletionFromStripeSession(stripe, session);
    } catch {
      /** ללא webhook מקומי: עדיין מנסים לסנכרן; כשל שקט כדי לא לשבור UX */
    }
  }

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
