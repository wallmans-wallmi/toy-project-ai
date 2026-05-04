import Link from "next/link";

export function ClaudeFooter() {
  const year = new Date().getFullYear();
  return (
    <footer>
      <div className="footer-inner">
        <div className="footer-logo">
          <span aria-hidden>🧸</span> נפרדים בחיוך
        </div>
        <nav className="footer-links" aria-label="קישורים בתחתית האתר">
          <Link href="/#about">אודות</Link>
          <Link href="/#contact">צור קשר</Link>
          <Link href="/terms">מדיניות פרטיות ותנאי שימוש</Link>
          <Link href="/accessibility">הצהרת נגישות</Link>
          <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer">
            אינסטגרם — נפרדים בחיוך (נפתח בחלון חדש)
          </a>
        </nav>
        <div className="footer-copy">
          © {year} נפרדים בחיוך · מעוצב עם <span aria-hidden>❤️</span> בישראל
        </div>
      </div>
    </footer>
  );
}
