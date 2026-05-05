"use client";

import { PasswordField } from "@/components/admin/password-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { TeamMemberRow } from "@/lib/admin-team-member";
import { cn } from "@/lib/utils";
import { useCallback, useEffect, useId, useState } from "react";

type Props = {
  member: TeamMemberRow | null;
  open: boolean;
  onClose: () => void;
  onSaved: (toast: string) => void;
};

function displayName(m: TeamMemberRow): string {
  const e = m.email.trim();
  const at = e.indexOf("@");
  return at > 0 ? e.slice(0, at) : e;
}

export function EditUserModal({ member, open, onClose, onSaved }: Props) {
  const emailId = useId();
  const passId = useId();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [localErr, setLocalErr] = useState<string | null>(null);

  useEffect(() => {
    if (member) {
      setEmail(member.email);
      setPassword("");
      setLocalErr(null);
    }
  }, [member]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!member) return;
      setLocalErr(null);
      const trimmed = email.trim();
      if (!trimmed.includes("@")) {
        setLocalErr("אימייל לא תקין — חסר @ או משהו דומה");
        return;
      }
      const pwd = password.trim();
      if (trimmed === member.email && pwd === "") {
        setLocalErr("אין מה לעדכן — שינו משהו או סגרו בנימוס");
        return;
      }
      if (pwd !== "" && pwd.length < 8) {
        setLocalErr("סיסמה חדשה צריכה לפחות 8 תווים — גם לנו יש סטנדרטים");
        return;
      }
      setBusy(true);
      try {
        const body: Record<string, string> = {};
        if (trimmed !== member.email) body.email = trimmed;
        if (pwd !== "") body.password = pwd;
        const res = await fetch(`/api/admin/users/${member.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(body),
        });
        const data = (await res.json()) as { error?: string };
        if (!res.ok) {
          setLocalErr(data.error ?? "לא נשמר");
          return;
        }
        onSaved(`אחותי, הפרטים של ${displayName(member)} עודכנו בסטייל! ✨`);
        onClose();
      } finally {
        setBusy(false);
      }
    },
    [member, email, password, onClose, onSaved],
  );

  if (!open || !member) return null;

  return (
    <div className="fixed inset-0 z-[500] flex items-end justify-center bg-black/45 p-4 sm:items-center" role="presentation" onMouseDown={(ev) => ev.target === ev.currentTarget && onClose()}>
      <div role="dialog" aria-modal className={cn("max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-[#9333EA]/25 bg-white p-4 shadow-xl")} dir="rtl" lang="he" onMouseDown={(e) => e.stopPropagation()}>
        <p className="text-[15px] font-bold text-[#581c87]">עריכת משתמש</p>
        <p className="mt-1 text-[12px] text-slate-600">{member.email}</p>
        <form className="mt-4 space-y-3" onSubmit={(e) => void handleSubmit(e)}>
          {localErr ? (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-800" role="alert">
              {localErr}
            </p>
          ) : null}
          <div>
            <Label htmlFor={emailId} className="text-[11px] font-bold text-slate-800">
              אימייל
            </Label>
            <Input id={emailId} type="email" required className="mt-1 rounded-xl border-slate-200 text-start" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="off" />
          </div>
          <div>
            <Label htmlFor={passId} className="text-[11px] font-bold text-slate-800">
              סיסמה חדשה (ריק = לא משנים)
            </Label>
            <PasswordField id={passId} className="mt-1 rounded-xl border-slate-200 text-start" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" placeholder="לפחות 8 תווים אם ממלאים" />
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1 rounded-xl border-[#ec4899]/40 text-[#ec4899] hover:bg-pink-50" onClick={onClose}>
              ביטול
            </Button>
            <Button type="submit" disabled={busy} className="flex-1 rounded-xl bg-[#9333EA] font-bold text-white hover:bg-[#7c3aed]">
              {busy ? "שומרים…" : "שמירה"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
