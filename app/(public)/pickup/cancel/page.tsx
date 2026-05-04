import type { Metadata } from "next";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "התשלום בוטל",
  description: "לא חויבתם. אפשר לנסות שוב כשתרצו.",
};

export default function PickupCancelPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center sm:px-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-8">
        <h1 className="text-2xl font-bold text-slate-900">התשלום לא הושלם</h1>
        <p className="mt-3 text-pretty leading-relaxed text-slate-600">
          לא בוצע חיוב. הבקשה נשמרה אצלנו כטיוטה. כדי לאשר איסוף נצטרך להשלים את התשלום בטופס.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/pickup" className={cn(buttonVariants(), "rounded-full bg-[#a855f7] hover:bg-[#9333ea]")}>
            חזרה לטופס
          </Link>
          <Link href="/" className={cn(buttonVariants({ variant: "outline" }), "rounded-full")}>
            דף הבית
          </Link>
        </div>
      </div>
    </div>
  );
}
