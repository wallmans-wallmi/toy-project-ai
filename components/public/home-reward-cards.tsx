"use client";

import { Eye, X } from "lucide-react";
import { useCallback, useEffect, useId, useState, type ReactNode } from "react";
import type { DonationJourneyId } from "@/lib/donation-journey";
import { DONATION_JOURNEY_EMOJI } from "@/lib/donation-journey";

type RewardKey = "toys" | "pacifier" | "diaper" | "bottle";

const REWARD_KEY_JOURNEY: Record<RewardKey, DonationJourneyId> = {
  toys: "toy_dropoff",
  pacifier: "pacifier_weaning",
  diaper: "diaper_weaning",
  bottle: "bottle_weaning",
};

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
    emoji: DONATION_JOURNEY_EMOJI[REWARD_KEY_JOURNEY.toys],
    giftHeading: "איך נראית המתנה לדוגמה",
    giftText:
      "מארז קטן ושמח — למשל מדבקות ליומן, סימנייה צבעונית או הפתעה קטנה שמתאימה לגיל. כל זה מגיע יחד עם המכתב בצורה נעימה וקלה לפתיחה.",
    letterHeading: "טעימה מהמכתב מ־AI",
    letterSample:
      "״היי נועם! שמי רועי ואני גר כאן קצת רחוק ממך. כשהגיע אלי הדוב המחבק שלך פתחתי את הקופסה עם חיוך ענק. הוא נראה ממש אהוב ואני כבר מחכה להסביר לו איפה הוא ישן אצלי… תודה שנתת לו המשך דרך חדשה ושמחה. חיבוק גדול!״",
  },
  pacifier: {
    title: "נפרדים מהמוצץ",
    emoji: DONATION_JOURNEY_EMOJI[REWARD_KEY_JOURNEY.pacifier],
    giftHeading: "איך נראית המתנה לדוגמה",
    giftText:
      "תעודת בוגר חמה עם שם הילד והתאריך שלכם, ומדליה קטנה עם סרט רך — משהו ממשי שאפשר להציג על הקיר או לשמור בתיבת זיכרונות.",
    letterHeading: "טעימה מתעודת הבוגר (טקסט לדוגמה)",
    letterSample:
      "״בוגרים על המוצץ — אלוף אמיתי! היום סימנתם יחד צעד גדול: נכנסים לעולם הגדולים עם גאווה וביטחון. אנחנו גאים בך על האומץ והסבלנות. זה רגע לחגוג!״",
  },
  diaper: {
    title: "נפרדים מהחיתול",
    emoji: DONATION_JOURNEY_EMOJI[REWARD_KEY_JOURNEY.diaper],
    giftHeading: "איך נראית המתנה לדוגמה",
    giftText:
      "תחתון ראשון \"שלי\" במתנה קטנה ומכובדת — סמל חמוד לצעד הגדול, יחד עם מכתב שמדגיש כמה גדלתם ביחד.",
    letterHeading: "טעימה מהמכתב מ־AI",
    letterSample:
      "״שלום שירה! רציתי לספר לך משהו מיוחד — החיתולים הגיעו אלינו בדרך טובה ואנחנו ממש מתרגשים מהפרידה החכמה שלך. את כבר גדולה, ואני שומרת את המכתב הזה כדי שתזכרי כמה חזקה את בכל בחירה שעשית…״",
  },
  bottle: {
    title: "נפרדים מהבקבוק",
    emoji: DONATION_JOURNEY_EMOJI[REWARD_KEY_JOURNEY.bottle],
    giftHeading: "איך נראית המתנה לדוגמה",
    giftText:
      "תעודת בוגר חמה ומדליה עדינה — כמו במסלול המוצץ, מותאמות לגיל ולרגע של הגמילה מהבקבוק או הפורמולה.",
    letterHeading: "טעימה מתעודת הבוגר (טקסט לדוגמה)",
    letterSample:
      "״בוגרים על הבקבוק — כל הכבוד! יחד עברתם דרך של סבלנות והקשבה, והיום יש רגע של גאווה משפחתית. זה הישג שממש כדאי לחגוג יחד.״",
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
    emoji: DONATION_JOURNEY_EMOJI[REWARD_KEY_JOURNEY.toys],
    title: "מסירת צעצועים",
    body: (
      <>
        הילד מקבל <strong>מכתב AI</strong> מהחבר שכביכול קיבל את הצעצועים שלו ומספר לו כמה הוא שמח ואוהב אותם
      </>
    ),
    tag: "📬 מכתב AI + מתנה קטנה",
  },
  {
    key: "pacifier",
    emoji: DONATION_JOURNEY_EMOJI[REWARD_KEY_JOURNEY.pacifier],
    title: "נפרדים מהמוצץ",
    body: (
      <>
        הילד מקבל <strong>תעודת בוגר</strong> ומדליה על היותו בוגר ואלוף, רגע של גאווה אמיתית שהוא לא ישכח
      </>
    ),
    tag: "🏅 תעודת בוגר + מדליה",
  },
  {
    key: "diaper",
    emoji: DONATION_JOURNEY_EMOJI[REWARD_KEY_JOURNEY.diaper],
    title: "נפרדים מהחיתול",
    body: (
      <>
        הילד מקבל <strong>מכתב AI מרגש</strong> ומתנה מיוחדת, התחתון הראשון שלו, סמל לצעד הגדול שעשה.
      </>
    ),
    tag: "📬 מכתב AI + מתנה קטנה",
  },
  {
    key: "bottle",
    emoji: DONATION_JOURNEY_EMOJI[REWARD_KEY_JOURNEY.bottle],
    title: "נפרדים מהבקבוק",
    body: (
      <>
        הילד מקבל <strong>תעודת בוגר</strong> ומדליה על היותו בוגר ואלוף, כי כל צעד גדילה ראוי לחגיגה.
      </>
    ),
    tag: "🏅 תעודת בוגר + מדליה",
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
        <h2 className="section-title hc-rewards-title">פרס מותאם לכל שלב</h2>
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
