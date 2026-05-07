"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePortalPhoneAuth } from "@/hooks/use-portal-phone-auth";
import { requestPortalCustomerSync } from "@/hooks/use-portal-sync";

function safeAccountNext(raw: string | null): string {
  if (!raw || !raw.startsWith("/")) return "/account/dashboard";
  if (!raw.startsWith("/account")) return "/account/dashboard";
  if (raw.startsWith("/account/login")) return "/account/dashboard";
  return raw;
}

export function PortalLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const auth = usePortalPhoneAuth();
  const [postLoginBusy, setPostLoginBusy] = useState(false);

  const onVerified = async () => {
    setPostLoginBusy(true);
    try {
      await requestPortalCustomerSync();
      router.replace(safeAccountNext(searchParams.get("next")));
      router.refresh();
    } finally {
      setPostLoginBusy(false);
    }
  };

  return (
    <div className="relative mx-auto w-full max-w-md space-y-6 rounded-3xl border border-violet-100 bg-white p-6 pt-12 shadow-sm sm:p-8 sm:pt-14" dir="rtl" lang="he">
      <Link
        href="/"
        className="absolute top-4 end-4 inline-flex size-10 items-center justify-center rounded-full border border-violet-200 bg-white text-slate-600 shadow-sm transition-colors hover:border-[#9333EA]/40 hover:bg-violet-50 hover:text-[#9333EA]"
        aria-label="סגירה וחזרה לדף הבית"
        title="דף הבית"
      >
        <X className="size-5" strokeWidth={2.25} aria-hidden />
      </Link>
      <p className="text-center">
        <Link href="/" className="text-sm font-semibold text-[#9333EA] hover:underline">
          חזרה לדף הבית
        </Link>
      </p>
      <div>
        <h1 className="text-xl font-bold text-slate-900">התחברות לחשבון</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          נשלח לכם קוד חד־פעמי ב־SMS. ודאו שהטלפון תואם למספר שמילאתם בבקשת האיסוף כדי לסנכרן את ההיסטוריה
        </p>
      </div>

      {auth.step === "phone" ? (
        <div className="space-y-3">
          <Label htmlFor="portal-phone">מספר טלפון</Label>
          <Input
            id="portal-phone"
            type="tel"
            dir="ltr"
            className="rounded-xl text-end"
            placeholder="050-0000000"
            value={auth.phoneRaw}
            onChange={(e) => auth.setPhoneRaw(e.target.value)}
            autoComplete="tel"
          />
          <Button
            type="button"
            className="w-full rounded-xl bg-[#9333EA] text-white hover:bg-[#7c3aed]"
            disabled={auth.busy}
            onClick={() => void auth.sendOtp()}
          >
            {auth.busy ? "שולחים…" : "שליחת קוד SMS"}
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <Label htmlFor="portal-otp">קוד מההודעה</Label>
          <Input
            id="portal-otp"
            inputMode="numeric"
            dir="ltr"
            className="rounded-xl text-end tracking-widest"
            placeholder="6 ספרות"
            value={auth.otp}
            onChange={(e) => auth.setOtp(e.target.value)}
            autoComplete="one-time-code"
          />
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-between">
            <Button type="button" variant="outline" className="rounded-xl" disabled={auth.busy} onClick={auth.reset}>
              שינוי מספר
            </Button>
            <Button
              type="button"
              className="rounded-xl bg-[#9333EA] text-white hover:bg-[#7c3aed] sm:min-w-[140px]"
              disabled={auth.busy || postLoginBusy}
              onClick={async () => {
                const ok = await auth.verifyOtp();
                if (ok) await onVerified();
              }}
            >
              {auth.busy || postLoginBusy ? "מאמתים…" : "כניסה"}
            </Button>
          </div>
        </div>
      )}

      {auth.message ? (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-800" role="status">
          {auth.message}
        </p>
      ) : null}
    </div>
  );
}
