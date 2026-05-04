"use client";

import { Accessibility, Link2, Minus, Plus, Type, X } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState, type SVGProps } from "react";

const STORAGE = {
  contrast: "nifradim-a11y-high-contrast",
  text: "nifradim-a11y-text-scale",
  underline: "nifradim-a11y-underline-links",
  readable: "nifradim-a11y-readable-font",
} as const;

type TextScaleKey = "100" | "112" | "125";

function readStored(key: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  try {
    return window.localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}

function writeStored(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* ignore */
  }
}

function applyDom(
  highContrast: boolean,
  textScale: TextScaleKey,
  underlineLinks: boolean,
  readableFont: boolean,
) {
  const root = document.documentElement;
  if (highContrast) root.dataset.a11yHighContrast = "true";
  else delete root.dataset.a11yHighContrast;

  if (textScale === "100") delete root.dataset.a11yTextScale;
  else root.dataset.a11yTextScale = textScale;

  if (underlineLinks) root.dataset.a11yLinkUnderline = "true";
  else delete root.dataset.a11yLinkUnderline;

  if (readableFont) root.dataset.a11yReadableFont = "true";
  else delete root.dataset.a11yReadableFont;
}

/**
 * וידג'ט צף להגדרות נגישות (ניגודיות, טקסט, קישורים, גופן).
 */
export function AccessibilityMenu() {
  const panelId = useId();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [textScale, setTextScale] = useState<TextScaleKey>("100");
  const [underlineLinks, setUnderlineLinks] = useState(false);
  const [readableFont, setReadableFont] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const hc = readStored(STORAGE.contrast, "0") === "1";
    const ts = readStored(STORAGE.text, "100") as TextScaleKey;
    const ul = readStored(STORAGE.underline, "0") === "1";
    const rf = readStored(STORAGE.readable, "0") === "1";
    const scale: TextScaleKey = ts === "112" || ts === "125" ? ts : "100";
    setHighContrast(hc);
    setTextScale(scale);
    setUnderlineLinks(ul);
    setReadableFont(rf);
    applyDom(hc, scale, ul, rf);
    setHydrated(true);
  }, []);

  const closePanel = useCallback(() => {
    setOpen(false);
    queueMicrotask(() => toggleRef.current?.focus());
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closePanel();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, closePanel]);

  const persistAndApply = useCallback(
    (next: {
      highContrast?: boolean;
      textScale?: TextScaleKey;
      underlineLinks?: boolean;
      readableFont?: boolean;
    }) => {
      const hc = next.highContrast ?? highContrast;
      const ts = next.textScale ?? textScale;
      const ul = next.underlineLinks ?? underlineLinks;
      const rf = next.readableFont ?? readableFont;
      setHighContrast(hc);
      setTextScale(ts);
      setUnderlineLinks(ul);
      setReadableFont(rf);
      writeStored(STORAGE.contrast, hc ? "1" : "0");
      writeStored(STORAGE.text, ts);
      writeStored(STORAGE.underline, ul ? "1" : "0");
      writeStored(STORAGE.readable, rf ? "1" : "0");
      applyDom(hc, ts, ul, rf);
    },
    [highContrast, readableFont, textScale, underlineLinks],
  );

  const bumpText = (dir: 1 | -1) => {
    const order: TextScaleKey[] = ["100", "112", "125"];
    const i = order.indexOf(textScale);
    const next = order[Math.min(order.length - 1, Math.max(0, i + dir))];
    persistAndApply({ textScale: next });
  };

  if (!hydrated) return null;

  return (
    <div className="fixed bottom-4 start-4 z-[9980]" dir="rtl" lang="he">
      {open ? (
        <div
          id={panelId}
          role="dialog"
          aria-modal="true"
          aria-labelledby="a11y-menu-title"
          className="mb-3 w-[min(100vw-2rem,18rem)] rounded-xl border border-[#9333EA]/25 bg-white p-4 shadow-lg outline-none"
        >
          <div className="mb-3 flex items-center justify-between gap-2 border-b border-slate-200 pb-2">
            <h2 id="a11y-menu-title" className="text-sm font-bold text-[#111827]">
              הגדרות נגישות
            </h2>
            <button
              type="button"
              className="rounded-lg p-1.5 text-slate-600 transition-colors hover:bg-[#F9F5FF] hover:text-[#9333EA] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#9333EA] focus-visible:outline-offset-2"
              aria-label="סגירת תפריט נגישות"
              onClick={closePanel}
            >
              <X className="size-5" aria-hidden />
            </button>
          </div>

          <ul className="m-0 flex list-none flex-col gap-3 p-0">
            <li>
              <button
                type="button"
                role="switch"
                aria-checked={highContrast}
                className="flex w-full items-center gap-3 rounded-lg border border-transparent px-2 py-2 text-start text-sm font-medium text-[#111827] transition-colors hover:border-[#9333EA]/20 hover:bg-[#F9F5FF] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#9333EA] focus-visible:outline-offset-2"
                onClick={() => persistAndApply({ highContrast: !highContrast })}
              >
                <HighContrastIcon className="size-5 shrink-0 text-[#9333EA]" aria-hidden />
                מצב ניגודיות גבוהה
              </button>
            </li>
            <li>
              <div className="flex items-center justify-between gap-2 rounded-lg px-2 py-2 hover:bg-[#F9F5FF]/80">
                <span className="flex items-center gap-3 text-sm font-medium text-[#111827]">
                  <Type className="size-5 shrink-0 text-[#9333EA]" aria-hidden />
                  גודל טקסט
                </span>
                <span className="flex items-center gap-1">
                  <button
                    type="button"
                    className="rounded-lg border border-[#9333EA]/20 p-1.5 text-[#9333EA] hover:bg-[#F9F5FF] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#9333EA] focus-visible:outline-offset-2 disabled:opacity-40"
                    aria-label="הקטנת טקסט"
                    disabled={textScale === "100"}
                    onClick={() => bumpText(-1)}
                  >
                    <Minus className="size-4" aria-hidden />
                  </button>
                  <span className="min-w-[2.5rem] text-center text-xs text-slate-600">
                    {textScale === "100" ? "רגיל" : textScale === "112" ? "גדול" : "גדול מאוד"}
                  </span>
                  <button
                    type="button"
                    className="rounded-lg border border-[#9333EA]/20 p-1.5 text-[#9333EA] hover:bg-[#F9F5FF] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#9333EA] focus-visible:outline-offset-2 disabled:opacity-40"
                    aria-label="הגדלת טקסט"
                    disabled={textScale === "125"}
                    onClick={() => bumpText(1)}
                  >
                    <Plus className="size-4" aria-hidden />
                  </button>
                </span>
              </div>
            </li>
            <li>
              <button
                type="button"
                role="switch"
                aria-checked={underlineLinks}
                className="flex w-full items-center gap-3 rounded-lg border border-transparent px-2 py-2 text-start text-sm font-medium text-[#111827] transition-colors hover:border-[#9333EA]/20 hover:bg-[#F9F5FF] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#9333EA] focus-visible:outline-offset-2"
                onClick={() => persistAndApply({ underlineLinks: !underlineLinks })}
              >
                <Link2 className="size-5 shrink-0 text-[#9333EA]" aria-hidden />
                קו תחתון לכל הקישורים
              </button>
            </li>
            <li>
              <button
                type="button"
                role="switch"
                aria-checked={readableFont}
                className="flex w-full items-center gap-3 rounded-lg border border-transparent px-2 py-2 text-start text-sm font-medium text-[#111827] transition-colors hover:border-[#9333EA]/20 hover:bg-[#F9F5FF] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#9333EA] focus-visible:outline-offset-2"
                onClick={() => persistAndApply({ readableFont: !readableFont })}
              >
                <Accessibility className="size-5 shrink-0 text-[#9333EA]" aria-hidden />
                גופן קריא מערכת
              </button>
            </li>
          </ul>

          <p className="mt-3 border-t border-slate-100 pt-3 text-xs leading-relaxed text-slate-600">
            ההגדרות נשמרות במכשיר זה. לפרטים נוספים ראו{" "}
            <a href="/accessibility" className="font-medium text-[#9333EA] underline underline-offset-2">
              הצהרת נגישות
            </a>
            .
          </p>
        </div>
      ) : null}

      <button
        ref={toggleRef}
        type="button"
        className="flex size-12 items-center justify-center rounded-full border-2 border-[#9333EA]/30 bg-white text-[#9333EA] shadow-md transition-colors hover:bg-[#F9F5FF] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#9333EA] focus-visible:outline-offset-2"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        aria-haspopup="dialog"
        aria-label="פתיחת תפריט נגישות"
        onClick={() => setOpen((v) => !v)}
      >
        <Accessibility className="size-6" aria-hidden />
      </button>
    </div>
  );
}

function HighContrastIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 18a6 6 0 0 0 0-12v12z" fill="currentColor" stroke="none" />
    </svg>
  );
}
