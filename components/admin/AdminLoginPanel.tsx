"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

type AdminLoginPanelProps = {
  onLogin: (password: string) => Promise<boolean>;
  error: string | null;
};

export function AdminLoginPanel({ onLogin, error }: AdminLoginPanelProps) {
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await onLogin(password);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto max-w-sm rounded-2xl border border-[#9333EA]/20 bg-white p-6 shadow-sm"
      dir="rtl"
      lang="he"
    >
      <h2 className="text-[16px] font-bold text-slate-900">כניסה לאזור ניהול</h2>
      <p className="mt-1 text-[12px] text-slate-600">הזינו את סיסמת האדמין שהוגדרה בשרת</p>
      <div className="mt-4 space-y-2">
        <Label htmlFor="admin-pw" className="text-[12px] font-semibold text-slate-700">
          סיסמה
        </Label>
        <Input
          id="admin-pw"
          type="password"
          autoComplete="current-password"
          className="h-11 rounded-xl border-slate-200"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      {error ? (
        <p className="mt-3 text-[12px] font-medium text-red-700" role="alert">
          {error}
        </p>
      ) : null}
      <Button
        type="submit"
        disabled={busy || !password.trim()}
        className="mt-5 w-full rounded-xl bg-[#9333EA] text-[14px] font-bold text-white hover:bg-[#7c3aed]"
      >
        {busy ? "מתחברים…" : "כניסה"}
      </Button>
    </form>
  );
}
