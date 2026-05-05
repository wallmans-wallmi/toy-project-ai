"use client";

import { EditUserModal } from "@/components/admin/EditUserModal";
import { PasswordField } from "@/components/admin/password-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdminSession } from "@/hooks/useAdminSession";
import type { AdminDashboardRole } from "@/lib/admin-role-types";
import type { TeamMemberRow } from "@/lib/admin-team-member";
import { cn } from "@/lib/utils";
import { Pencil } from "lucide-react";
import { useCallback, useEffect, useId, useState } from "react";

export type { TeamMemberRow } from "@/lib/admin-team-member";

function badgeClass(logistics: AdminDashboardRole): string {
  if (logistics === "admin") return "bg-[#9333EA] text-white ring-1 ring-[#9333EA]/40";
  if (logistics === "office") return "bg-[#ec4899] text-white ring-1 ring-pink-300";
  return "bg-slate-600 text-white ring-1 ring-slate-400";
}

function labelLogistics(r: AdminDashboardRole) {
  if (r === "admin") return "אדמין";
  if (r === "office") return "משרד";
  return "נהג/ת";
}

type UserManagementProps = {
  onNotify?: (msg: string | null) => void;
};

export function UserManagement({ onNotify }: UserManagementProps) {
  const newPassId = useId();
  const { canEditAdminCredentials } = useAdminSession();
  const [members, setMembers] = useState<TeamMemberRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newLogistics, setNewLogistics] = useState<AdminDashboardRole>("admin");
  const [busy, setBusy] = useState(false);
  const [editMember, setEditMember] = useState<TeamMemberRow | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch("/api/admin/users", { credentials: "include" });
      const data = (await res.json()) as { users?: TeamMemberRow[]; error?: string };
      if (!res.ok) {
        setErr(data.error ?? "לא נטען");
        setMembers([]);
        return;
      }
      setMembers(Array.isArray(data.users) ? data.users : []);
    } catch {
      setErr("בעיית רשת");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function changeLogistics(id: string, logistics_role: AdminDashboardRole) {
    onNotify?.(null);
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ logisticsRole: logistics_role }),
    });
    const data = (await res.json()) as { error?: string };
    if (!res.ok) {
      onNotify?.(data.error ?? "לא עודכן");
      return;
    }
    onNotify?.(`אחותי, התפקיד עודכן — עכשיו זה ${labelLogistics(logistics_role)} בסטייל`);
    await load();
  }

  async function removeMember(id: string, email: string) {
    if (!confirm(`אחותי, בטוחים? נמחק את ${email} מהצוות — אין חזרה.`)) return;
    onNotify?.(null);
    const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE", credentials: "include" });
    const data = (await res.json()) as { error?: string };
    if (!res.ok) {
      onNotify?.(data.error ?? "מחיקה נכשלה");
      return;
    }
    onNotify?.("נמחק בהצלחה — פחות אחד בקבוצת הווטסאפ");
    await load();
  }

  async function addMember(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    onNotify?.(null);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: newEmail,
          password: newPassword,
          role: "admin",
          logisticsRole: newLogistics,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setErr(data.error ?? "לא נוצר");
        return;
      }
      setNewEmail("");
      setNewPassword("");
      setNewLogistics("admin");
      onNotify?.("הצטרפות חמה לצוות — המשתמש נוצר, תשלחו לו סיסמה בסיגנל");
      await load();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6" dir="rtl" lang="he">
      <div>
        <h2 className="text-[16px] font-bold text-[#581c87]">ניהול צוות</h2>
        <p className="text-[12px] text-slate-600">מי נכנס למערכת, במה הוא עוסק, ומי סתם עושה רעש</p>
      </div>

      {err ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-800" role="alert">
          {err}
        </p>
      ) : null}

      <form className="rounded-2xl border border-[#9333EA]/20 bg-white p-4 shadow-sm" onSubmit={addMember}>
        <p className="text-[13px] font-bold text-slate-900">הוספת איש צוות</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <Label className="text-[11px]">אימייל</Label>
            <Input className="mt-1 rounded-xl border-slate-200" type="email" required value={newEmail} onChange={(e) => setNewEmail(e.target.value)} autoComplete="off" />
          </div>
          <div>
            <Label htmlFor={newPassId} className="text-[11px]">
              סיסמה ראשונית
            </Label>
            <PasswordField id={newPassId} className="mt-1 rounded-xl border-slate-200" required minLength={8} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} autoComplete="new-password" />
          </div>
          <div className="sm:col-span-2">
            <Label className="text-[11px]">תפקיד במערכת (לוגיסטיקה)</Label>
            <select className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-[13px]" value={newLogistics} onChange={(e) => setNewLogistics(e.target.value as AdminDashboardRole)}>
              <option value="admin">אדמין</option>
              <option value="office">משרד</option>
              <option value="driver">נהג/ת</option>
            </select>
          </div>
        </div>
        <Button type="submit" disabled={busy} className="mt-4 w-full rounded-xl bg-[#9333EA] font-bold text-white hover:bg-[#7c3aed] sm:w-auto">
          {busy ? "יוצרים…" : "הוספה לצוות"}
        </Button>
      </form>

      {loading ? <p className="text-center text-[13px] text-slate-600">טוענים את ההייררכיה…</p> : null}

      <ul className="flex flex-col gap-3">
        {members.map((m) => (
          <li key={m.id} className="rounded-2xl border border-[#9333EA]/15 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-[14px] font-bold text-slate-900">{m.email}</p>
                <p className="text-[11px] text-slate-500">חשבון: {m.account_role === "superadmin" ? "סופר־אדמין" : "אדמין"}</p>
              </div>
              <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-bold", badgeClass(m.logistics_role))}>{labelLogistics(m.logistics_role)}</span>
            </div>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
              <Label className="sr-only">שינוי תפקיד לוגיסטיקה</Label>
              <select
                className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2 text-[13px]"
                value={m.logistics_role}
                onChange={(e) => void changeLogistics(m.id, e.target.value as AdminDashboardRole)}
                aria-label={`תפקיד לוגיסטיקה עבור ${m.email}`}
              >
                <option value="admin">אדמין</option>
                <option value="office">משרד</option>
                <option value="driver">נהג/ת</option>
              </select>
              {canEditAdminCredentials ? (
                <Button
                  type="button"
                  variant="outline"
                  className="inline-flex gap-1.5 rounded-xl border-[#9333EA]/40 font-bold text-[#581c87] hover:bg-[#F9F5FF]"
                  onClick={() => {
                    setEditMember(m);
                    setEditOpen(true);
                  }}
                >
                  <Pencil className="size-3.5 shrink-0" aria-hidden />
                  עריכה
                </Button>
              ) : null}
              <Button type="button" variant="outline" className="rounded-xl border-rose-200 text-rose-700 hover:bg-rose-50" onClick={() => void removeMember(m.id, m.email)}>
                מחיקת גישה
              </Button>
            </div>
          </li>
        ))}
      </ul>

      <EditUserModal
        member={editMember}
        open={editOpen}
        onClose={() => {
          setEditOpen(false);
          setEditMember(null);
        }}
        onSaved={(toast) => {
          onNotify?.(toast);
          void load();
        }}
      />
    </div>
  );
}
