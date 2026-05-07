"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/** סרגל תחתון קבוע — מוסתר בדף מילוי הטופס כדי לא להציג כפתור «תיאום איסוף» כפול */
export function ClaudeMobileCta() {
  const pathname = usePathname();
  if (pathname === "/pickup") {
    return null;
  }

  return (
    <div className="mobile-cta-bar">
      <Link href="/pickup">📦 התחילו עכשיו</Link>
    </div>
  );
}
