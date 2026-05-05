"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  title: string;
  body: string;
  onClose: () => void;
};

export function LetterPreviewModal({ open, title, body, onClose }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[600] flex items-end justify-center bg-black/50 p-4 sm:items-center" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal className={cn("max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[#9333EA]/20 bg-white p-4 shadow-xl")} dir="rtl" lang="he" onMouseDown={(e) => e.stopPropagation()}>
        <h2 className="text-[16px] font-bold text-[#9333EA]">{title}</h2>
        <pre className="mt-3 max-h-[55vh] overflow-y-auto whitespace-pre-wrap rounded-xl bg-[#F9F5FF] p-3 text-[13px] leading-relaxed text-slate-900">
          {body || "עדיין אין טקסט — אחרי תשלום ה־AI יתחיל לעבוד, רגע אחד של סבלנות"}
        </pre>
        <Button type="button" className="mt-4 w-full rounded-xl bg-[#9333EA] font-bold text-white hover:bg-[#7c3aed]" onClick={onClose}>
          סגירה
        </Button>
      </div>
    </div>
  );
}
