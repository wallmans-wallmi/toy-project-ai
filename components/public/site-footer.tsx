import Link from "next/link";

const links = [
  { href: "/services", label: "שירותים" },
  { href: "/pickup", label: "הזמנת איסוף" },
  { href: "/terms", label: "תנאי שירות" },
  { href: "https://www.instagram.com/", label: "אינסטגרם", external: true },
];

export function SiteFooter() {
  return (
    <footer className="mt-auto bg-slate-900 text-slate-200">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-6 px-4 py-10 sm:flex-row sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold text-white">
          נפרדים בחיוך
          <span aria-hidden>🧸</span>
        </Link>
        <nav aria-label="קישורים תחתונים" className="flex flex-wrap justify-center gap-6 text-sm">
          {links.map((item) =>
            item.external ? (
              <a
                key={item.href}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-300 transition-colors hover:text-white"
              >
                {item.label}
              </a>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className="text-slate-300 transition-colors hover:text-white"
              >
                {item.label}
              </Link>
            ),
          )}
        </nav>
      </div>
      <div className="border-t border-slate-800 py-4 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} נפרדים בחיוך, מעוצב עם ❤️ בישראל
      </div>
    </footer>
  );
}
