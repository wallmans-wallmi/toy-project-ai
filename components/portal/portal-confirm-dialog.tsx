"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PortalConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  variant?: "default" | "danger";
  busy?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function PortalConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = "ביטול",
  variant = "default",
  busy = false,
  onCancel,
  onConfirm,
}: PortalConfirmDialogProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="presentation"
      dir="rtl"
      lang="he"
      onClick={onCancel}
    >
      <div
        className="max-w-md rounded-2xl border border-violet-100 bg-white p-6 shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="portal-confirm-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="portal-confirm-title" className="text-lg font-bold text-slate-900">
          {title}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">{description}</p>
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <Button type="button" variant="outline" className="rounded-xl" disabled={busy} onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button
            type="button"
            className={cn(
              "rounded-xl text-white",
              variant === "danger" ? "bg-red-600 hover:bg-red-700" : "bg-[#9333EA] hover:bg-[#7c3aed]",
            )}
            disabled={busy}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
