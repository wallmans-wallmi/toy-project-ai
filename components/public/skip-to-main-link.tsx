/**
 * קישור דילוג לתוכן — תקן 5568 / WCAG 2.4.1.
 * יעד: אלמנט עם id="main-content" (בדרך כלל `<main>`).
 */
export function SkipToMainLink() {
  return (
    <a href="#main-content" className="skip-to-main">
      דלג לתוכן הראשי
    </a>
  );
}
