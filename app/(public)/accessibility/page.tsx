import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "הצהרת נגישות",
  description: "מחויבות לנגישות באתר נפרדים בחיוך בהתאם לתקן הישראלי 5568 ו-WCAG 2.1 ברמת AA.",
};

export default function AccessibilityPage() {
  const year = new Date().getFullYear();
  return (
    <article className="mx-auto max-w-3xl space-y-8 px-4 py-12 sm:px-6 sm:py-16">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-accent-foreground">הצהרת נגישות</h1>
        <p className="text-sm text-muted-foreground">
          עודכן לאחרונה: מאי {year}
        </p>
      </header>

      <section aria-labelledby="sec-commitment" className="space-y-4 text-foreground">
        <h2 id="sec-commitment" className="text-lg font-semibold text-accent-foreground">
          מחויבות כללית
        </h2>
        <p className="leading-relaxed text-muted-foreground">
          אנו פועלים להנגשת האתר &quot;נפרדים בחיוך&quot; לאנשים עם מוגבלויות, ובפרט עבור משתמשי קוראי מסך,
          תמיכה במקלדת, התאמות ראייה וניגודיות, והתאמה לכיוון עברית מימין לשמאל (RTL). המטרה שלנו היא עמידה
          בהוראות תקן הנגישות הישראלי <strong>ת&quot;י 5568</strong> לפי רמת <strong>AA</strong> של{" "}
          <abbr title="Web Content Accessibility Guidelines">WCAG</abbr> 2.1, ככל שניתן בסביבת האינטרנט.
        </p>
      </section>

      <section aria-labelledby="sec-measures" className="space-y-4">
        <h2 id="sec-measures" className="text-lg font-semibold text-accent-foreground">
          אמצעי הנגישות באתר
        </h2>
        <ul className="list-inside list-disc space-y-2 text-muted-foreground">
          <li>מבנה סמנטי (כותרות, אזורים ראשיים, ניווט מסומן).</li>
          <li>קישור &quot;דלג לתוכן הראשי&quot; בתחילת העמוד להימנעות מחזרה על תפריטים.</li>
          <li>סימון מיקוד ברור במקלדת ובצבע מותג סגול (#9333EA).</li>
          <li>טפסים עם שיוך תוויות לשדות והודעות סטטוס לקוראי מסך.</li>
          <li>תפריט נגישות צף: ניגודיות גבוהה, הגדלת טקסט, קו תחתון לקישורים וגופן מערכת קריא.</li>
          <li>שימוש ברכיבי ממשק נגישים (כולל Radix UI במקומות רלוונטיים).</li>
        </ul>
      </section>

      <section aria-labelledby="sec-limits" className="space-y-4">
        <h2 id="sec-limits" className="text-lg font-semibold text-accent-foreground">
          מגבלות ידועות והמשך טיפול
        </h2>
        <p className="leading-relaxed text-muted-foreground">
          נגישות היא תהליך מתמשך. חלקים באתר עשויים להיות בשיפור (למשל תוכן צד שלישי, קבצי מדיה או עיצובים
          ישנים). אם נתקלתם במכשול — נשמח לקבל מכם פנייה כדי לטפל בהקדם האפשרי.
        </p>
      </section>

      <section aria-labelledby="sec-contact" className="space-y-4">
        <h2 id="sec-contact" className="text-lg font-semibold text-accent-foreground">
          רכז נגישות ופנייה בנושא נגישות
        </h2>
        <p className="leading-relaxed text-muted-foreground">
          לבירורים, בקשות להתאמות או דיווח על ליקוי נגישות, ניתן לפנות אל רכז הנגישות של האתר:
        </p>
        <ul className="list-none space-y-2 rounded-xl bg-muted/60 px-4 py-4 text-muted-foreground">
          <li>
            <strong className="text-accent-foreground">דוא&quot;ל:</strong>{" "}
            <span dir="ltr" className="inline-block">
              accessibility@nifradim.example
            </span>{" "}
            <span className="text-sm">(יש להחליף בכתובת פעילה לפני פרסום)</span>
          </li>
          <li>
            <strong className="text-accent-foreground">טלפון:</strong>{" "}
            <span dir="ltr">03-0000000</span>{" "}
            <span className="text-sm">(יש להשלים מספר פעיל ושעות פעילות)</span>
          </li>
        </ul>
        <p className="text-sm leading-relaxed text-muted-foreground">
          פנייה תטופל בהקדם האפשרי, ובכל מקרה בתוך <strong>14 ימי עסקים</strong>, בהתאם להנחיות הרשות להגנת
          הצרכן ולתקן 5568.
        </p>
      </section>

      <section aria-labelledby="sec-legal" className="rounded-xl border border-border bg-card px-4 py-4">
        <h2 id="sec-legal" className="text-base font-semibold text-accent-foreground">
          הערה משפטית
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          טקסט זה מהווה בסיס להצהרת נגישות; יש להשלים פרטי קשר אמיתיים, כתובת פיזית של העסק (אם נדרש),
          וליווי משפטי לפני פרסום סופי, בהתאם לדרישות החוק החלות על הארגון שלכם.
        </p>
      </section>
    </article>
  );
}
