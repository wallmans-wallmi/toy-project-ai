"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

export function ClaudeNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const prevMenuOpen = useRef(false);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    close();
  }, [pathname, close]);

  /** חזרת פוקוס להמבורגר רק אחרי סגירת המגירה — לא בטעינת דף */
  useEffect(() => {
    if (prevMenuOpen.current && !open) {
      hamburgerRef.current?.focus();
    }
    prevMenuOpen.current = open;
  }, [open]);

  /** פוקוס ראשון במגירה + Escape לסגירה */
  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => {
      panelRef.current?.querySelector<HTMLElement>(".mobile-nav-close")?.focus();
    }, 50);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  const hashLink = (id: string) => (pathname === "/" ? `#${id}` : `/#${id}`);

  const pickupCtaHref = "/pickup";

  return (
    <header>
      <nav aria-label="ניווט ראשי">
        <Link href="/" className="nav-logo">
          <div className="nav-logo-icon" aria-hidden>
            🧸
          </div>
          נפרדים בחיוך
        </Link>
        <ul className="nav-links">
          <li>
            <Link href={hashLink("how")}>איך זה עובד</Link>
          </li>
          <li>
            <Link href={hashLink("about")}>מי אנחנו</Link>
          </li>
          <li>
            <Link href={hashLink("contact")}>צור קשר</Link>
          </li>
        </ul>
        <Link href={pickupCtaHref} className="nav-cta">
          תיאום איסוף
        </Link>
        <button
          ref={hamburgerRef}
          type="button"
          className={`hamburger ${open ? "open" : ""}`}
          id="hamburgerBtn"
          aria-label={open ? "סגירת תפריט" : "פתיחת תפריט ניווט"}
          aria-expanded={open}
          aria-controls="mobileNavDrawer"
          onClick={() => setOpen((v) => !v)}
        >
          <span aria-hidden />
          <span aria-hidden />
          <span aria-hidden />
        </button>
      </nav>

      <div
        className={`mobile-nav-drawer ${open ? "open" : ""}`}
        id="mobileNavDrawer"
        aria-hidden={open ? undefined : true}
        inert={!open ? true : undefined}
      >
        <button
          type="button"
          className="mobile-nav-backdrop"
          aria-label="סגירת תפריט הניווט"
          tabIndex={open ? 0 : -1}
          onClick={close}
        />
        <div
          ref={panelRef}
          className="mobile-nav-panel"
          role="dialog"
          aria-modal="true"
          aria-labelledby="mobile-nav-dialog-title"
        >
          <h2 id="mobile-nav-dialog-title" className="sr-only">
            תפריט ניווט
          </h2>
          <div className="mobile-nav-top">
            <Link href="/" className="mobile-nav-logo" onClick={close}>
              <div className="nav-logo-icon" aria-hidden>
                🧸
              </div>
              נפרדים בחיוך
            </Link>
            <button type="button" className="mobile-nav-close" aria-label="סגירה" onClick={close}>
              <span aria-hidden>✕</span>
            </button>
          </div>
          <ul className="mobile-nav-links">
            <li>
              <Link href={hashLink("how")} onClick={close}>
                <div className="mnav-icon mi-1" aria-hidden>
                  ✨
                </div>
                איך זה עובד
              </Link>
            </li>
            <li>
              <Link href={hashLink("about")} onClick={close}>
                <div className="mnav-icon mi-2" aria-hidden>
                  🌱
                </div>
                מי אנחנו
              </Link>
            </li>
            <li>
              <Link href={hashLink("contact")} onClick={close}>
                <div className="mnav-icon mi-3" aria-hidden>
                  💌
                </div>
                צור קשר
              </Link>
            </li>
          </ul>
          <div className="mobile-nav-footer">
            <Link href={pickupCtaHref} onClick={close}>
              תיאום איסוף
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
