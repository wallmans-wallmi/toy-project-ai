"use client";

/**
 * Customer portal phone OTP (designated auth hook for login).
 * @see hooks/use-customer-portal.ts — alias לייבוא אחיד
 */
import { useCallback, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { DEV_MOCK_OTP_CODE, isDevAuthBypassEnabled, warnDevAuthBypassOnce } from "@/lib/portal/dev-mock-otp";
import { toE164IlPhone } from "@/lib/portal/phone";

type OtpStep = "phone" | "otp";

export function usePortalPhoneAuth() {
  const [step, setStep] = useState<OtpStep>("phone");
  const [phoneRaw, setPhoneRaw] = useState("");
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const sendOtp = useCallback(async () => {
    setMessage(null);
    const e164 = toE164IlPhone(phoneRaw);
    if (!e164) {
      setMessage("נא להזין מספר טלפון ישראלי תקין");
      return false;
    }
    setBusy(true);
    try {
      if (isDevAuthBypassEnabled()) {
        warnDevAuthBypassOnce();
        // פיתוח: בלי signInWithOtp (ללא SMS / Unsupported phone provider)
        setStep("otp");
        return true;
      }

      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithOtp({
        phone: e164,
        options: { shouldCreateUser: true },
      });
      if (error) {
        setMessage(error.message === "Error sending confirmation OTP" ? "לא הצלחנו לשלוח קוד, נסו שוב" : error.message);
        return false;
      }
      setStep("otp");
      return true;
    } finally {
      setBusy(false);
    }
  }, [phoneRaw]);

  const verifyOtp = useCallback(async () => {
    setMessage(null);
    const e164 = toE164IlPhone(phoneRaw);
    const trimmedOtp = otp.trim();
    if (!e164 || trimmedOtp.length < 4) {
      setMessage("נא להזין את הקוד שקיבלתם ב־SMS");
      return false;
    }
    setBusy(true);
    try {
      if (isDevAuthBypassEnabled()) {
        warnDevAuthBypassOnce();
        if (trimmedOtp !== DEV_MOCK_OTP_CODE) {
          setMessage("במצב פיתוח: נא להזין את הקוד 111111");
          return false;
        }
        // TODO: Remove hardcoded OTP and integrate real Supabase SMS Auth before production
        const res = await fetch("/api/portal/dev-mock-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: e164 }),
          credentials: "same-origin",
        });
        const data = (await res.json()) as { access_token?: string; refresh_token?: string; error?: string };
        if (!res.ok || !data.access_token || !data.refresh_token) {
          setMessage(data.error ?? "מצב פיתוח: לא ניתן ליצור סשן, בדקו את השרת");
          return false;
        }
        const supabase = createSupabaseBrowserClient();
        const { error: sessionErr } = await supabase.auth.setSession({
          access_token: data.access_token,
          refresh_token: data.refresh_token,
        });
        if (sessionErr) {
          setMessage("מצב פיתוח: יצירת הסשן נכשלה");
          return false;
        }
        return true;
      }

      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.verifyOtp({
        phone: e164,
        token: trimmedOtp,
        type: "sms",
      });
      if (error) {
        setMessage("הקוד לא תקין או שפג תוקף, נסו שוב");
        return false;
      }
      return true;
    } finally {
      setBusy(false);
    }
  }, [phoneRaw, otp]);

  const reset = useCallback(() => {
    setStep("phone");
    setOtp("");
    setMessage(null);
  }, []);

  return {
    step,
    phoneRaw,
    setPhoneRaw,
    otp,
    setOtp,
    busy,
    message,
    sendOtp,
    verifyOtp,
    reset,
  };
}
