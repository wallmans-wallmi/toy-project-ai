import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/services#about", label: "אודות" },
  { href: "/#stories", label: "סיפורים" },
  { href: "/pickup", label: "תיאום איסוף" },
  { href: "/services", label: "איך זה עובד" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-violet-100/80 bg-[#F9F5FF]/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:gap-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex min-w-0 shrink-0 items-center gap-2 text-base font-bold text-slate-900 transition-opacity hover:opacity-80 sm:text-lg"
        >
          <span aria-hidden>🧸</span>
          <span className="truncate">נפרדים בחיוך</span>
        </Link>

        <nav
          aria-label="ניווט ראשי"
          className="order-3 flex w-full flex-wrap items-center justify-center gap-x-1 gap-y-2 text-sm font-medium text-slate-600 md:order-none md:w-auto md:justify-center md:gap-x-3 lg:text-base"
        >
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-2.5 py-2 transition-colors hover:bg-violet-100/80 hover:text-[#9333EA] md:px-3"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/pickup"
          className={cn(
            buttonVariants({ size: "lg" }),
            "ms-auto shrink-0 rounded-full bg-[#9333EA] px-4 py-2 text-sm font-bold text-white hover:bg-[#7c3aed] sm:px-6 sm:text-base",
          )}
        >
          <span className="flex items-center gap-1.5">
            <span aria-hidden>📦</span>
            בואו נתרום
          </span>
        </Link>
      </div>
    </header>
  );
}
