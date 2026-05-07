"use client";

import { FileText } from "lucide-react";
import { cn } from "@/lib/utils";

const PENDING_TITLE = "החשבונית תופק לאחר סיום התשלום";

type Props = {
  invoiceUrl: string | null;
  /** כפתור מלא או אייקון בשורה קומפקטית */
  variant?: "button" | "icon";
  className?: string;
};

/** חשבונית/קבלה: פתיחה בטאב חדש כשיש URL, אחרת כפתור מנוטרל עם הסבר */
export function PortalOrderInvoiceControl({ invoiceUrl, variant = "button", className }: Props) {
  const url = (invoiceUrl ?? "").trim();
  const has = url.length > 0;

  if (variant === "icon") {
    if (has) {
      return (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className={cn("inline-flex shrink-0 rounded-lg p-1.5 text-[#9333EA] hover:bg-[#9333EA]/10", className)}
          aria-label="צפייה בחשבונית בחלון חדש"
        >
          <FileText className="size-4" aria-hidden />
        </a>
      );
    }
    return (
      <button
        type="button"
        disabled
        className={cn("inline-flex shrink-0 cursor-not-allowed rounded-lg p-1.5 text-slate-300", className)}
        title={PENDING_TITLE}
        aria-label={PENDING_TITLE}
      >
        <FileText className="size-4 opacity-60" aria-hidden />
      </button>
    );
  }

  if (has) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#9333EA]/45 bg-white px-3 py-2 text-xs font-bold text-[#9333EA] shadow-sm transition-colors hover:bg-[#9333EA]/8",
          className,
        )}
        aria-label="צפייה בחשבונית בחלון חדש"
      >
        <FileText className="size-4 shrink-0" aria-hidden />
        חשבונית
      </a>
    );
  }

  return (
    <button
      type="button"
      disabled
      className={cn(
        "inline-flex cursor-not-allowed items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-400",
        className,
      )}
      title={PENDING_TITLE}
      aria-label={PENDING_TITLE}
    >
      <FileText className="size-4 shrink-0 opacity-50" aria-hidden />
      חשבונית
    </button>
  );
}
