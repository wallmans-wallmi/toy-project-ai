"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { UserRound } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

/**
 * אייקון פרופיל בכותרת: מחוברים → לוח בקרה, אורחים → התחברות OTP
 */
export function PortalAccountNavIcon({ className }: { className?: string }) {
  const [href, setHref] = useState("/account/login");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const supabase = createSupabaseBrowserClient();
    void supabase.auth.getSession().then(({ data }) => {
      setHref(data.session?.user ? "/account/dashboard" : "/account/login");
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_e, session) => {
      setHref(session?.user ? "/account/dashboard" : "/account/login");
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <Link
      href={href}
      className={cn(
        "inline-flex size-10 items-center justify-center rounded-full border border-violet-200 bg-white text-[#9333EA] shadow-sm transition-colors hover:bg-[#F9F5FF]",
        className,
      )}
      aria-label={mounted && href.includes("dashboard") ? "האזור האישי" : "התחברות לחשבון"}
      prefetch={false}
    >
      <UserRound className="size-5" strokeWidth={2} aria-hidden />
    </Link>
  );
}
