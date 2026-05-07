"use client";

import { Eye, X } from "lucide-react";
import { useCallback, useEffect, useId, useState, type ReactNode } from "react";
import { DONATION_JOURNEY_EMOJI } from "@/lib/donation-journey";

type RewardKey = "toys";

type RewardPreview = {
  title: string;
  emoji: string;
  giftHeading: string;
  giftText: string;
  letterHeading: string;
  letterSample: string;
};

const PREVIEWS: Record<RewardKey, RewardPreview> = {
  toys: {
    title: "מסירת צעצועים",
    emoji: DONATION_JOURNEY_EMOJI.toy_dropoff,
    giftHeading: "איך נראית המתנה לדוגמה",
    giftText:
      "מארז קטן ושמח — למשל מדבקות ליומן, סימנייה צבעונית או הפתעה קטנה שמתאימה לגיל. כל זה מגיע יחד עם המכתב בצורה נעימה וקלה לפתיחה.",
    letterHeading: "טעימה מהמכתב מ־AI",
    letterSample:
      "״היי נועם! שמי רועי ואני גר כאן קצת רחוק ממך. כשהגיע אלי הדוב המחבק שלך פתחתי את הקופסה עם חיוך ענק. הוא נראה ממש אהוב ואני כבר מחכה להסביר לו איפה הוא ישן אצלי… תודה שנתת לו המשך דרך חדשה ושמחה. חיבוק גדול!״",
  },
};

const CARDS: {
  key: RewardKey;
  emoji: string;
  title: string;
  body: ReactNode;
  tag: string;
}[] = [
  {
    key: "toys",
    emoji: DONATION_JOURNEY_EMOJI.toy_dropoff,
    title: "מסירת צעצועים",
    body: (
      <>
        הילד מקבל <strong>מכתב AI</strong> מהחבר שכביכול קיבל את הצעצועים שלו ומספר לו כמה הוא שמח ואוהב אותם
      </>
    ),
    tag: "📬 מכתב AI + מתנה קטנה",
  },
];

export function HomeRewardCards() {
  const [openKey, setOpenKey] = useState<RewardKey | null>(null);
  const titleId = useId();
  const preview = openKey ? PREVIEWS[openKey] : null;

  const close = useCallback(() => setOpenKey(null), []);

  useEffect(() => {
    if (!openKey) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [openKey]);

  useEffect(() => {
    if (!openKey) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openKey, close]);

  return (
    <div className="rewards-block-claude">
      <div className="rewards-header-claude hc-stack hc-stack--center hc-prose">
        <span className="section-label">מה הילד מקבל</span>
        <h2 className="section-title hc-rewards-title">מכתב ומתנה אחרי תרומת צעצועים</h2>
      </div>
      <div className="how-reward-grid">
        {CARDS.map(({ key, emoji, title, body, tag }) => (
          <button
            key={key}
            type="button"
            className="reward-card reward-card--clickable"
            onClick={() => setOpenKey(key)}
          >
            <div className="reward-emoji">{emoji}</div>
            <div className="reward-content">
              <div className="reward-content-heading-row">
                <h3>{title}</h3>
                <span className="reward-preview-link">
                  <Eye className="reward-preview-link-icon" aria-hidden />
                  צפייה בדוגמה
                </span>
              </div>
              <p>{body}</p>
              <div className="reward-tag">{tag}</div>
            </div>
          </button>
        ))}
      </div>

      {preview ? (
        <div className="reward-modal-backdrop" role="presentation" onClick={close}>
          <div
            className="reward-modal-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            onClick={(e) => e.stopPropagation()}
          >
            <button type="button" className="reward-modal-close" onClick={close} aria-label="סגירה">
              <X className="reward-modal-close-icon" aria-hidden />
            </button>
            <div className="reward-modal-header">
              <span className="reward-modal-emoji" aria-hidden>
                {preview.emoji}
              </span>
              <h2 id={titleId} className="reward-modal-title">
                {preview.title}
              </h2>
              <p className="reward-modal-sub">
                דוגמה להדמיה — המתנה והניסוח האמיתיים מותאמים אישית לכל משפחה
              </p>
            </div>
            <div className="reward-modal-section">
              <h3 className="reward-modal-section-title">{preview.giftHeading}</h3>
              <p className="reward-modal-section-text">{preview.giftText}</p>
            </div>
            <div className="reward-modal-letter">
              <h3 className="reward-modal-section-title">{preview.letterHeading}</h3>
              <p className="reward-modal-letter-quote">{preview.letterSample}</p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
