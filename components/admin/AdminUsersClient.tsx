"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type AdminUserRow = {
  id: string;
  email: string;
  role: string;
  created_at: string;
  updated_at: string;
};

export function AdminUsersClient() {
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [needLogin, setNeedLogin] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<"admin" | "superadmin">("admin");
  const [busy, setBusy] = useState(false);
  const [passwordEdits, setPasswordEdits] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/users", { credentials: "include" });
      if (res.status === 401) {
        setNeedLogin(true);
        setUsers([]);
        return;
      }
      const data = (await res.json()) as { users?: AdminUserRow[]; error?: string };
      if (!res.ok) {
        setError(data.error ?? "שגיאה");
        setUsers([]);
        return;
      }
      setNeedLogin(false);
      setUsers(Array.isArray(data.users) ? data.users : []);
    } catch {
      setError("בעיית רשת");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function addUser(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: newEmail, password: newPassword, role: newRole }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "לא נוצר");
        return;
      }
      setNewEmail("");
      setNewPassword("");
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function updatePassword(userId: string) {
    const pw = (passwordEdits[userId] ?? "").trim();
    if (pw.length < 8) {
      setError("סיסמה חדשה צריכה לפחות 8 תווים");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ password: pw }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "עדכון נכשל");
        return;
      }
      setPasswordEdits((m) => ({ ...m, [userId]: "" }));
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function removeUser(id: string) {
    if (!confirm("למחוק את המשתמש? זה סופי, בלי דרמה")) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE", credentials: "include" });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "מחיקה נכשלה");
        return;
      }
      await load();
    } finally {
      setBusy(false);
    }
  }

  if (needLogin && !loading) {
    return (
      <div className="min-h-[60vh] bg-[#F9F5FF] px-4 py-12 text-center" dir="rtl" lang="he">
        <p className="text-[14px] text-slate-700">צריך להתחבר קודם — זה אזור לצוות בלבד</p>
        <Link href="/admin" className="mt-4 inline-block text-[13px] font-bold text-[#9333EA] underline">
          חזרה לכניסה
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F5FF] pb-16 pt-8" dir="rtl" lang="he">
      <header className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3 px-4">
        <div>
          <h1 className="text-[16px] font-bold text-[#581c87]">משתמשי ניהול</h1>
          <p className="text-[12px] text-slate-600">מוסיפים, מעדכנים ומוחקים — בזהירות ובחיוך</p>
        </div>
        <Link
          href="/admin"
          className="inline-flex items-center justify-center rounded-xl border border-[#9333EA]/40 bg-white px-4 py-2 text-[12px] font-semibold text-[#581c87] transition-colors hover:bg-[#F9F5FF]"
        >
          חזרה ללוח
        </Link>
      </header>

      <main className="mx-auto mt-8 max-w-3xl space-y-8 px-4">
        {error ? (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-[12px] text-red-800" role="alert">
            {error}
          </p>
        ) : null}

        <section className="rounded-2xl border border-[#9333EA]/15 bg-white p-5 shadow-sm">
          <h2 className="text-[14px] font-bold text-slate-900">הוספת אדמין חדש</h2>
          <p className="mt-1 text-[11px] text-slate-600">סיסמה חזקה (8+), אימייל אמיתי — ככה נשמרים בטוחים</p>
          <form className="mt-4 space-y-3" onSubmit={addUser}>
            <div>
              <Label htmlFor="nu-email" className="text-[11px]">
                אימייל
              </Label>
              <Input
                id="nu-email"
                type="email"
                autoComplete="email"
                className="mt-1 h-10 rounded-xl border-slate-200"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="nu-pw" className="text-[11px]">
                סיסמה
              </Label>
              <Input
                id="nu-pw"
                type="password"
                autoComplete="new-password"
                className="mt-1 h-10 rounded-xl border-slate-200"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={8}
                required
              />
            </div>
            <div>
              <Label htmlFor="nu-role" className="text-[11px]">
                תפקיד
              </Label>
              <select
                id="nu-role"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-[13px]"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as "admin" | "superadmin")}
              >
                <option value="admin">אדמין</option>
                <option value="superadmin">סופר־אדמין</option>
              </select>
            </div>
            <Button type="submit" disabled={busy} className="w-full rounded-xl bg-[#9333EA] font-bold text-white hover:bg-[#7c3aed]">
              {busy ? "שומרים…" : "הוספה"}
            </Button>
          </form>
        </section>

        <section className="rounded-2xl border border-[#9333EA]/15 bg-white p-5 shadow-sm">
          <h2 className="text-[14px] font-bold text-slate-900">רשימה</h2>
          {loading ? <p className="mt-3 text-[13px] text-slate-600">טוענים…</p> : null}
          {!loading && users.length === 0 ? (
            <p className="mt-3 text-[13px] text-slate-600">אין עדיין משתמשים בטבלה — אחרי שתוסיפו, ההתחברות תהיה לפי אימייל</p>
          ) : null}
          <ul className="mt-4 divide-y divide-slate-100">
            {users.map((u) => (
              <li key={u.id} className="space-y-2 border-b border-slate-100 py-4 last:border-0">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-[13px] font-semibold text-slate-900">{u.email}</p>
                    <p className="text-[11px] text-slate-500">
                      {u.role} · נוצר {new Date(u.created_at).toLocaleDateString("he-IL")}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-lg border-rose-200 text-rose-700 hover:bg-rose-50"
                    disabled={busy}
                    onClick={() => void removeUser(u.id)}
                  >
                    מחיקה
                  </Button>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                  <div className="min-w-0 flex-1">
                    <Label className="text-[10px] text-slate-600">סיסמה חדשה (עריכה)</Label>
                    <Input
                      type="password"
                      autoComplete="new-password"
                      className="mt-0.5 h-9 rounded-lg border-slate-200 text-[12px]"
                      placeholder="••••••••"
                      value={passwordEdits[u.id] ?? ""}
                      onChange={(e) => setPasswordEdits((m) => ({ ...m, [u.id]: e.target.value }))}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="shrink-0 rounded-lg border-[#9333EA]/40 text-[#581c87]"
                    disabled={busy || !(passwordEdits[u.id] ?? "").trim()}
                    onClick={() => void updatePassword(u.id)}
                  >
                    עדכון סיסמה
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
