"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";
import { useEffect, useId, useState } from "react";

type AdminLoginPanelProps = {
  onLogin: (password: string, email?: string) => Promise<boolean>;
  error: string | null;
};

export function AdminLoginPanel({ onLogin, error }: AdminLoginPanelProps) {
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [requiresEmail, setRequiresEmail] = useState<boolean | null>(null);
  const pwId = useId();
  const emailId = useId();

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/admin/auth-config");
        const data = (await res.json()) as { requiresEmail?: boolean };
        if (!cancelled) setRequiresEmail(Boolean(data.requiresEmail));
      } catch {
        if (!cancelled) setRequiresEmail(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const emailArg = requiresEmail ? email.trim() : email.trim() || undefined;
      await onLogin(password, emailArg);
    } finally {
      setBusy(false);
    }
  }

  const showEmailField = requiresEmail === true;
  const canSubmit =
    password.trim() !== "" && (requiresEmail !== true || email.trim() !== "") && requiresEmail !== null;

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto max-w-sm rounded-2xl border border-[#9333EA]/20 bg-white p-6 shadow-sm"
      dir="rtl"
      lang="he"
    >
      <h2 className="text-[16px] font-bold text-slate-900">כניסה לאזור ניהול</h2>
      <p className="mt-1 text-[12px] text-slate-600">
        {showEmailField
          ? "הזינו את האימייל והסיסמה שהוגדרו לכם בצוות"
          : "הזינו את סיסמת הניהול — אם עברתם למשתמשים בטבלה, תופיע כאן גם שורת אימייל"}
      </p>

      {requiresEmail === null ? (
        <p className="mt-4 text-center text-[12px] text-slate-500">בודקים את מצב ההתחברות…</p>
      ) : null}

      {showEmailField ? (
        <div className="mt-4 space-y-2">
          <Label htmlFor={emailId} className="text-[12px] font-semibold text-slate-700">
            אימייל
          </Label>
          <Input
            id={emailId}
            type="email"
            autoComplete="username"
            className="h-11 rounded-xl border-slate-200"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
      ) : requiresEmail === false ? (
        <input
          type="text"
          name="username"
          autoComplete="username"
          defaultValue="admin"
          tabIndex={-1}
          readOnly
          className="sr-only"
          aria-hidden="true"
        />
      ) : null}

      <div className="mt-4 space-y-2">
        <Label htmlFor={pwId} className="text-[12px] font-semibold text-slate-700">
          סיסמה
        </Label>
        <div className="relative">
          <Input
            id={pwId}
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            className="h-11 rounded-xl border-slate-200 ps-3 pe-11"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            className={cn(
              "absolute end-2 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 outline-none transition-colors",
              "hover:bg-[#F9F5FF] hover:text-[#9333EA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9333EA] focus-visible:ring-offset-2",
            )}
            onClick={() => setShowPassword((v) => !v)}
            aria-pressed={showPassword}
            aria-label={showPassword ? "הסתרת סיסמה" : "הצגת סיסמה"}
            title={showPassword ? "הסתרת סיסמה" : "הצגת סיסמה"}
          >
            {showPassword ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
          </button>
        </div>
      </div>
      {error ? (
        <p className="mt-3 text-[12px] font-medium text-red-700" role="alert">
          {error}
        </p>
      ) : null}
      <Button
        type="submit"
        disabled={busy || !canSubmit}
        className="mt-5 w-full rounded-xl bg-[#9333EA] text-[14px] font-bold text-white hover:bg-[#7c3aed]"
      >
        {busy ? "מתחברים…" : "כניסה"}
      </Button>
    </form>
  );
}
