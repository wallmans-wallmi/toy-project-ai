"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { PortalConfirmDialog } from "@/components/portal/portal-confirm-dialog";

export function PortalAccountDeleteSection() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const deleteAccount = async () => {
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch("/api/portal/account", { method: "DELETE", credentials: "same-origin" });
      const body = (await res.json()) as { success?: boolean; error?: string };
      if (!res.ok || !body.success) {
        setErr(body.error ?? "מחיקה נכשלה");
        return;
      }
      const supabase = createSupabaseBrowserClient();
      await supabase.auth.signOut();
      router.replace("/");
      router.refresh();
    } finally {
      setBusy(false);
      setOpen(false);
    }
  };

  return (
    <section className="rounded-2xl border border-red-100 bg-red-50/40 p-5" dir="rtl" lang="he">
      <h2 className="text-sm font-bold text-red-900">בטיחות חשבון</h2>
      <p className="mt-2 text-xs leading-relaxed text-red-800/90">
        מחיקת חשבון היא פעולה סופית ותמחק את גישת ההתחברות. נתוני תרומות יישארו במערכת ללא קישור אישי
      </p>
      <button
        type="button"
        className="mt-4 rounded-xl border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-800"
        onClick={() => setOpen(true)}
      >
        מחיקת חשבון
      </button>
      {err ? <p className="mt-3 text-sm text-red-800">{err}</p> : null}
      <PortalConfirmDialog
        open={open}
        title="למחוק את החשבון?"
        description="פעולה זו תמחק לצמיתות את משתמש ההתחברות. לא ניתן לבטל."
        confirmLabel="מחיקה סופית"
        variant="danger"
        busy={busy}
        onCancel={() => setOpen(false)}
        onConfirm={() => void deleteAccount()}
      />
    </section>
  );
}
