import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "תקנון ומדיניות פרטיות",
  description: "תנאי שימוש ומדיניות פרטיות: נפרדים בחיוך.",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-12 sm:px-6 sm:py-16">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-accent-foreground">תקנון ומדיניות פרטיות</h1>
        <p className="text-sm text-muted-foreground">
          גרסת טיוטה · מאי {new Date().getFullYear()}
        </p>
      </header>
      <div className="space-y-6 text-muted-foreground">
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-accent-foreground">תנאי שימוש</h2>
          <p className="leading-relaxed">
            השימוש באתר כפוף לתנאים שיפורסמו כאן בעת השקה. כרגע מדובר במבנה אתר ראשוני ללא
            מתן שירות מסחרי מלא. יש להשלים סעיפים משפטיים מלאים לפני קבלת תרומות בפועל.
          </p>
        </section>
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-accent-foreground">פרטיות ונתונים</h2>
          <p className="leading-relaxed">
            נארוז כאן בהמשך את סוגי המידע שנאסף (למשל פרטי תיאום איסוף), מטרות העיבוד, בסיסים
            חוקיים, זכויות הנושאים והעברות לצדדים שלישיים, בהתאם לחוק הגנת הפרטיות התשפ&quot;א
            ולתקנות הנלוות.
          </p>
        </section>
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-accent-foreground">יצירת קשר</h2>
          <p className="leading-relaxed">
            לשאלות בנושא תקנון או פרטיות נוסיף כאן פרטי קשר ברגע שיהיו זמינים.
          </p>
        </section>
      </div>
    </div>
  );
}
