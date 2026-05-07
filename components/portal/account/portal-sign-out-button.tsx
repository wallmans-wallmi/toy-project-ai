"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { PortalConfirmDialog } from "@/components/portal/portal-confirm-dialog";

type PortalSignOutButtonProps = {
  variant?: "outline" | "ghost";
};

export function PortalSignOutButton({ variant = "outline" }: PortalSignOutButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const onSignOut = async () => {
    setBusy(true);
    try {
      const supabase = createSupabaseBrowserClient();
      await supabase.auth.signOut();
      router.replace("/");
      router.refresh();
    } finally {
      setBusy(false);
      setOpen(false);
    }
  };

  const base =
    variant === "ghost"
      ? "text-sm font-semibold text-slate-600 underline-offset-2 hover:text-[#9333EA] hover:underline"
      : "rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-[#F9F5FF]";

  return (
    <>
      <button type="button" className={base} onClick={() => setOpen(true)}>
        התנתקות
      </button>
      <PortalConfirmDialog
        open={open}
        title="להתנתק מהחשבון?"
        description="הסשן ייסגר במכשיר זה ותועברו לדף הבית."
        confirmLabel="התנתקות"
        busy={busy}
        onCancel={() => setOpen(false)}
        onConfirm={() => void onSignOut()}
      />
    </>
  );
}
