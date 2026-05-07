"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function PortalShellHeader() {
  const router = useRouter();

  const signOut = async () => {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.replace("/");
    router.refresh();
  };

  const homeIconClass = cn(
    "inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-violet-200 bg-white text-slate-600 shadow-sm transition-colors hover:border-[#9333EA]/40 hover:bg-violet-50 hover:text-[#9333EA]",
  );

  return (
    <header className="border-b border-violet-100 bg-[#F9F5FF]/90 backdrop-blur-sm" dir="rtl" lang="he">
      <div className="mx-auto flex max-w-[500px] items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Link href="/" className={homeIconClass} aria-label="סגירה וחזרה לדף הבית" title="דף הבית">
            <X className="size-5" strokeWidth={2.25} aria-hidden />
          </Link>
          <Link href="/" className="truncate text-sm font-bold text-[#9333EA] hover:underline">
            חזרה לדף הבית
          </Link>
        </div>
        <Button
          type="button"
          variant="outline"
          className="shrink-0 rounded-xl border-slate-200 text-sm"
          onClick={() => void signOut()}
        >
          התנתקות
        </Button>
      </div>
    </header>
  );
}
