import Link from "next/link";
import { ClaudeMarketingHomeAboutBelow } from "@/components/public/claude-marketing-home-about-below";
import { HomeRewardCards } from "@/components/public/home-reward-cards";
import { PICKUP_FEE_ILS } from "@/lib/constants/pricing";
import { pickupUrlWithJourney } from "@/lib/donation-checkout-items";
import { DONATION_JOURNEY_EMOJI } from "@/lib/donation-journey";

const HERO_VISUAL_SLOTS = [
  {
    journeyId: "toy_dropoff" as const,
    slotClass: "vg-bg-1",
    title: "תרומת צעצועים",
    subtitle: "איסוף עד הבית ומכתב חם",
  },
];

export function ClaudeMarketingHome() {
  return (
    <>
      <div className="hero" id="top">
        <div className="hero-inner">
          <div className="hero-text hc-text-stack">
            <div className="hero-badge">
              <span>+2,400 צעצועים מצאו בית חדש</span>
            </div>
            <h1 className="hero-h1">
              <span className="hero-h1-dark">נפרדים מהישן</span>
              <br />
              <span className="hero-h1-purple">וממשיכים לצמוח בחיוך</span>
            </h1>
            <p className="hero-sub">
              השירות שלנו מתמקד בתרומת צעצועים בלבד: איסוף נוח, טיפול בפריטים, ומכתב חם לילד אחרי שמצאו בית חדש לצעצועים
            </p>
            <div className="hero-actions">
              <Link href="/pickup" className="btn-primary-purple hero-pickup-primary">
                התחילו עכשיו
              </Link>
              <a href="#how" className="btn-link-how hero-how-link">
                ← איך זה עובד
              </a>
            </div>
            <div className="hero-stats">
              <div className="stat-item">
                <div className="stat-num">2,417</div>
                <div className="stat-label">צעצועים נתרמו</div>
              </div>
              <div className="stat-item">
                <div className="stat-num">1,890</div>
                <div className="stat-label">ילדים שמחו</div>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-visual-inner" style={{ position: "relative", width: "100%", maxWidth: 500 }}>
              <div className="hero-card-grid-wrap">
                <div className="hero-visual-grid">
                  {HERO_VISUAL_SLOTS.map(({ journeyId, slotClass, title, subtitle }) => (
                    <Link key={journeyId} href={pickupUrlWithJourney()} className={`vg-slot ${slotClass}`}>
                      <div className="vg-slot-bg">
                        <span className="vg-slot-emoji" aria-hidden>
                          {DONATION_JOURNEY_EMOJI[journeyId]}
                        </span>
                      </div>
                      <div className="vg-label">
                        {title}
                        <span className="vg-label-sub">{subtitle}</span>
                      </div>
                    </Link>
                  ))}
                </div>

                <div className="mini-letter" style={{ marginTop: 16 }}>
                  <strong>✉️ מכתב השבוע מ-AI</strong>
                  &quot;שלום! שמי מיה, ואני כל כך שמחה שהדוב הקטן שלך הגיע אלי. כל לילה אני חובקת אותו ומרגישה שאת שולחת לי חיבוק...&quot;
                </div>
              </div>

              <div className="float-badge float-badge-1" style={{ left: "auto", right: "-24px" }}>
                <div className="badge-dot dot-green" />
                <span>3 איסופים היום 🚗</span>
              </div>

              <div className="float-badge float-badge-2">
                <div className="badge-dot dot-purple" />
                <span>מכתב חדש נשלח ✉️</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section id="how" className="process-section">
        <div className="process-header hc-stack hc-stack--center hc-prose">
          <span className="section-label">איך זה עובד</span>
          <h2 className="section-title">חווית הפרידה הכי קלה שיכולה להיות</h2>
          <p className="section-sub">
            אנחנו כאן כדי לייצר לילדכם חוויית פרידה קלה וזורמת מצעצועים שכבר לא בשימוש, עם איסוף עד הבית ומכתב חם שמחבר בין התורם לילד שקיבל
          </p>
        </div>

        <div className="process-cards">
          <div className="process-arrow arrow-1">←</div>
          <div className="process-arrow arrow-2">←</div>

          <div className="process-card pc-1">
            <div className="process-card-top">
              <div className="process-num pn-1">1</div>
              <span className="process-icon">🛍️</span>
            </div>
            <div className="process-card-content">
              <h3>אוספים יחד</h3>
              <p>
                יחד עם הילד אוספים צעצועים שכבר לא בשימוש, שמים בשקית או אריזה מתאימה, ומשתתפים יחד בתהליך ובחוויה.
              </p>
            </div>
          </div>
          <div className="process-card pc-2">
            <div className="process-card-top">
              <div className="process-num pn-2">2</div>
              <span className="process-icon">🚗</span>
            </div>
            <div className="process-card-content">
              <h3>אנחנו באים אליכם</h3>
              <p>
                מתאמים איסוף דרך האתר ואנחנו מגיעים בזמן שקבעתם. אין צורך להיות בבית, תמיד אפשר להשאיר מחוץ לדלת.
              </p>
            </div>
          </div>
          <div className="process-card pc-3">
            <div className="process-card-top">
              <div className="process-num pn-3">3</div>
              <span className="process-icon">✉️</span>
            </div>
            <div className="process-card-content">
              <h3>מכתב ומתנה מיוחדת</h3>
              <p>
                הילד מקבל מכתב AI ומתנה קטנה שמתאימה לתרומת הצעצועים. הכל נשלח בדואר לביתכם. רוצים מהר? יש גם משלוח אקספרס.
              </p>
            </div>
          </div>
        </div>

        <HomeRewardCards />
      </section>

      <section id="form" className="form-section">
        <div className="form-wrap">
          <div className="form-info">
            <div className="hc-stack hc-prose">
              <span className="section-label">תיאום איסוף</span>
              <h2 className="section-title">
                מוכנים
                <br />
                לשמח מישהו?
              </h2>
              <p className="section-sub">ממלאים, אנחנו מגיעים. פשוט כמו שזה נשמע.</p>
            </div>

            <div className="form-promise">
              <div className="promise-item">
                <div className="promise-icon pi-1">🔒</div>
                <div className="promise-text">
                  <h4>פרטיות מלאה</h4>
                  <p>הפרטים שלכם מאובטחים ולא עוברים לשום גורם שלישי.</p>
                </div>
              </div>
              <div className="promise-item">
                <div className="promise-icon pi-2">🚗</div>
                <div className="promise-text">
                  <h4>איסוף עד הבית</h4>
                  <p>
                    דמי איסוף חד־פעמיים {PICKUP_FEE_ILS} ₪. אנחנו מגיעים אליכם בזמן שתואם, בלי דמי משלוח נפרדים
                  </p>
                </div>
              </div>
              <div className="promise-item">
                <div className="promise-icon pi-3">📬</div>
                <div className="promise-text">
                  <h4>עדכון שקוף אחרי המסירה</h4>
                  <p>
                    כשהצעצועים מגיעים ליעד נעדכן אתכם, נשלח תמונה כשאפשר, ונשתף לאן בדיוק נתרמו כדי שתסגרו את המעגל עם חיוך
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="home-pickup-cta">
            <p className="home-pickup-cta-title">מתחילים מתיאום איסוף</p>
            <p className="home-pickup-cta-text">
              עוברים לדף קצר ונעים — ממלאים פרטי איסוף ותרומת צעצועים ומשלמים בצורה מאובטחת. בערך דקה ובלי להסתבך.
            </p>
            <Link href="/pickup" className="btn-primary-purple home-pickup-cta-btn">
              התחילו עכשיו
            </Link>
            <p className="home-pickup-cta-hint">מאובטח · איסוף עד הבית · מכתב AI לילד</p>
          </div>
        </div>
      </section>

      <ClaudeMarketingHomeAboutBelow />
    </>
  );
}
