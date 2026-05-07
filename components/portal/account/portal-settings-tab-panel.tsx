"use client";

import Link from "next/link";
import { useState } from "react";
import type { PortalCustomerProfile } from "@/lib/portal/types";
import { PortalSignOutButton } from "@/components/portal/account/portal-sign-out-button";

type PortalSettingsTabPanelProps = {
  profile: PortalCustomerProfile;
  userId: string;
  saveProfile: (patch: Partial<PortalCustomerProfile>, userId: string) => Promise<{ ok: boolean }>;
  onSaved: () => void;
};

export function PortalSettingsTabPanel({ profile, userId, saveProfile, onSaved }: PortalSettingsTabPanelProps) {
  const [note, setNote] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const persist = async (patch: Partial<PortalCustomerProfile>) => {
    setSaving(true);
    setNote(null);
    const r = await saveProfile(patch, userId);
    setSaving(false);
    setNote(r.ok ? "נשמר" : "שמירה נכשלה");
    if (r.ok) onSaved();
  };

  return (
    <div className="space-y-6 rounded-2xl border border-violet-100 bg-white p-5 shadow-sm" dir="rtl" lang="he">
      <h2 className="text-sm font-bold text-[#9333EA]">העדפות</h2>

      <div className="flex items-center justify-between gap-4 border-b border-violet-50 pb-4">
        <span className="text-sm font-medium text-slate-800">התראות SMS</span>
        <button
          type="button"
          role="switch"
          aria-checked={profile.notifySms}
          disabled={saving}
          className={`relative inline-flex h-7 w-12 shrink-0 rounded-full transition-colors ${profile.notifySms ? "bg-[#9333EA]" : "bg-slate-200"}`}
          onClick={() => void persist({ notifySms: !profile.notifySms })}
        >
          <span
            className={`absolute top-0.5 inline-block size-6 rounded-full bg-white shadow transition-[inset-inline-start] ${profile.notifySms ? "start-5" : "start-0.5"}`}
          />
        </button>
      </div>

      <div className="flex items-center justify-between gap-4 border-b border-violet-50 pb-4">
        <span className="text-sm font-medium text-slate-800">התראות במייל</span>
        <button
          type="button"
          role="switch"
          aria-checked={profile.notifyEmail}
          disabled={saving}
          className={`relative inline-flex h-7 w-12 shrink-0 rounded-full transition-colors ${profile.notifyEmail ? "bg-[#9333EA]" : "bg-slate-200"}`}
          onClick={() => void persist({ notifyEmail: !profile.notifyEmail })}
        >
          <span
            className={`absolute top-0.5 inline-block size-6 rounded-full bg-white shadow transition-[inset-inline-start] ${profile.notifyEmail ? "start-5" : "start-0.5"}`}
          />
        </button>
      </div>

      <div className="space-y-2">
        <label htmlFor="ui-locale" className="text-sm font-medium text-slate-800">
          שפת ממשק
        </label>
        <select
          id="ui-locale"
          className="w-full rounded-xl border border-slate-200 bg-[#F9F5FF]/50 px-3 py-2 text-sm"
          value={profile.uiLocale}
          disabled={saving}
          onChange={(e) => {
            const v = e.target.value === "en" ? "en" : "he";
            void persist({ uiLocale: v });
          }}
        >
          <option value="he">עברית (ברירת מחדל)</option>
          <option value="en">English (ממשק בסיסי)</option>
        </select>
        <p className="text-xs text-slate-500">שינוי שפה נשמר בחשבון. חלק מהמסכים עדיין בעברית בלבד</p>
      </div>

      <div className="border-t border-violet-50 pt-4">
        <Link href="/terms" className="text-sm font-semibold text-[#9333EA] underline-offset-2 hover:underline">
          מדיניות פרטיות ותנאי שירות
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-4 border-t border-violet-50 pt-4">
        <PortalSignOutButton />
      </div>

      {note ? <p className="text-center text-xs text-slate-600">{note}</p> : null}
    </div>
  );
}
