import Link from "next/link";
import { HomeRewardCards } from "@/components/public/home-reward-cards";
import { PICKUP_FEE_ILS } from "@/lib/constants/pricing";
import { pickupUrlWithJourney } from "@/lib/donation-checkout-items";
import type { DonationJourneyId } from "@/lib/donation-journey";
import { DONATION_JOURNEY_EMOJI } from "@/lib/donation-journey";

const HERO_VISUAL_SLOTS: {
  journeyId: DonationJourneyId;
  slotClass: string;
  title: string;
  subtitle: string;
}[] = [
  {
    journeyId: "toy_dropoff",
    slotClass: "vg-bg-1",
    title: "מסירת צעצועים",
    subtitle: "מפנים מקום בבית",
  },
  {
    journeyId: "pacifier_weaning",
    slotClass: "vg-bg-2",
    title: "נפרדים מהמוצץ",
    subtitle: "גמילה מהמוצץ",
  },
  {
    journeyId: "diaper_weaning",
    slotClass: "vg-bg-3",
    title: "נפרדים מהחיתול",
    subtitle: "גמילה מחיתולים",
  },
  {
    journeyId: "bottle_weaning",
    slotClass: "vg-bg-4",
    title: "נפרדים מהבקבוק",
    subtitle: "גמילה מבקבוק",
  },
];

export function ClaudeMarketingHome() {
  return (
    <>
      <div className="hero" id="top">
        <div className="hero-inner">
          <div className="hero-text hc-text-stack">
            <div className="hero-badge">
              <span>+2,400 חפצים מצאו בית חדש</span>
            </div>
            <h1 className="hero-h1">
              <span className="hero-h1-dark">נפרדים מהישן</span>
              <br />
              <span className="hero-h1-purple">וממשיכים לצמוח בחיוך</span>
            </h1>
            <p className="hero-sub">
              הדרך המעצימה למסור חפצים שעבר זמנם ולהפוך כל שלב גדילה לרגע של גאווה עבור הילדים
            </p>
            <div className="hero-actions">
              <Link href="/pickup" className="btn-primary-purple hero-pickup-primary">
                תיאום איסוף
              </Link>
              <a href="#how" className="btn-link-how hero-how-link">
                ← איך זה עובד
              </a>
            </div>
            <div className="hero-stats">
              <div className="stat-item">
                <div className="stat-num">2,417</div>
                <div className="stat-label">פריטים נתרמו</div>
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
                    <Link key={journeyId} href={pickupUrlWithJourney(journeyId)} className={`vg-slot ${slotClass}`}>
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
            אנחנו כאן כדי לייצר לילדכם את חווית הפרידה הכי קלה וזורמת, מצעצועים ועד מוצצים, חיתולים ובקבוקים, וכל זה יחד עם הילד ובשמחה.
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
                יחד עם הילד אוספים את כל מה שלא צריך יותר ושמים בשקית או אריזה מתאימה, חלק מהתהליך וחלק מהחוויה.
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
                הילד מקבל מכתב AI ומתנה רלוונטית למה שמסר. הכל נשלח בדואר לביתכם. רוצים מהר? יש גם משלוח אקספרס.
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
                    כשהחפצים מגיעים ליעד נעדכן אתכם, נשלח תמונה כשאפשר, ונשתף לאן בדיוק הפריטים נתרמו כדי שתסגרו את המעגל עם חיוך
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="home-pickup-cta">
            <p className="home-pickup-cta-title">מתחילים מתיאום איסוף</p>
            <p className="home-pickup-cta-text">
              עוברים לדף קצר ונעים — בוחרים קטגוריה, ממלאים פרטים ומשלמים בצורה מאובטחת. בערך דקה ובלי להסתבך.
            </p>
            <Link href="/pickup" className="btn-primary-purple home-pickup-cta-btn">
              תיאום איסוף
            </Link>
            <p className="home-pickup-cta-hint">מאובטח · איסוף עד הבית · מכתב AI לילד</p>
          </div>
        </div>
      </section>

      <section id="about">
        <div className="hc-layout-inner hc-about-inner">
          <div className="hc-stack hc-prose">
            <span className="section-label">מי אנחנו</span>
            <h2 className="hc-about-title">נולדנו מתוך חוויה אמיתית</h2>
            <p className="section-sub hc-about-lead">
              כשרוצים לעזור לילד לגדול בצורה בריאה ושמחה, לא תמיד קל לדעת איך לעשות את זה נכון. פרידה מחפצים אהובים יכולה להיות קשה, ואנחנו כאן בדיוק כדי להפוך אותה לחגיגה.
            </p>
          </div>

          <div className="hc-about-vision">
            <h3 className="hc-about-vision-title">החזון שלנו</h3>
            <p className="hc-about-vision-text">
              עולם שבו כל שלב גדילה של ילד הוא רגע של גאווה ולא של אובדן. אנחנו מאמינים שפרידה נכונה מחפצים יכולה לבנות ביטחון, נדיבות ואמפתיה אצל הילדים.
            </p>
          </div>

          <div className="about-stats-grid hc-about-stats">
            <div style={{ textAlign: "center", background: "white", borderRadius: "var(--radius-sm)", padding: 24 }}>
              <div style={{ fontSize: "2rem", marginBottom: 8 }}>💜</div>
              <div style={{ fontSize: "1.5rem", fontWeight: 900, color: "#9333EA" }}>2,400+</div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: 4 }}>חפצים נמסרו</div>
            </div>
            <div style={{ textAlign: "center", background: "white", borderRadius: "var(--radius-sm)", padding: 24 }}>
              <div style={{ fontSize: "2rem", marginBottom: 8 }}>😊</div>
              <div style={{ fontSize: "1.5rem", fontWeight: 900, color: "#9333EA" }}>1,890+</div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: 4 }}>ילדים שמחו</div>
            </div>
            <div style={{ textAlign: "center", background: "white", borderRadius: "var(--radius-sm)", padding: 24 }}>
              <div style={{ fontSize: "2rem", marginBottom: 8 }}>⭐</div>
              <div style={{ fontSize: "1.5rem", fontWeight: 900, color: "#9333EA" }}>4.9</div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: 4 }}>דירוג ממוצע</div>
            </div>
          </div>

          <div className="hc-about-values">
            <h3 className="hc-about-values-title">הערכים שלנו</h3>
            <div className="hc-about-values-list">
              <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <span style={{ fontSize: "1.3rem", minWidth: 32 }}>🌱</span>
                <div>
                  <strong style={{ display: "block", fontSize: "0.9rem", marginBottom: 3 }}>גדילה עם שמחה</strong>
                  <span style={{ fontSize: "0.83rem", color: "var(--text-muted)" }}>כל שלב גדילה ראוי לחגיגה ולהכרה</span>
                </div>
              </div>
              <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <span style={{ fontSize: "1.3rem", minWidth: 32 }}>🤝</span>
                <div>
                  <strong style={{ display: "block", fontSize: "0.9rem", marginBottom: 3 }}>קהילה ונתינה</strong>
                  <span style={{ fontSize: "0.83rem", color: "var(--text-muted)" }}>
                    חפצים שעבר זמנם ממשיכים לשמח ילדים אחרים
                  </span>
                </div>
              </div>
              <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <span style={{ fontSize: "1.3rem", minWidth: 32 }}>💡</span>
                <div>
                  <strong style={{ display: "block", fontSize: "0.9rem", marginBottom: 3 }}>חדשנות עם לב</strong>
                  <span style={{ fontSize: "0.83rem", color: "var(--text-muted)" }}>
                    טכנולוגיית AI בשירות חוויות אנושיות ומרגשות
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="contact">
        <div className="hc-layout-inner hc-contact-inner">
          <div className="hc-stack hc-prose">
            <span className="section-label">צור קשר</span>
            <h2 className="hc-contact-title">נשמח לשמוע מכם</h2>
            <p className="section-sub hc-contact-lead">
              שאלה, הצעה או פשוט רוצים לספר לנו על הרגע המרגש? כתבו לנו
            </p>
          </div>

          <div className="hc-contact-form-card">
            <div className="field-row" style={{ marginBottom: 16 }}>
              <div className="field-group">
                <label htmlFor="contact-first">שם פרטי</label>
                <input id="contact-first" type="text" placeholder="רחל" />
              </div>
              <div className="field-group">
                <label htmlFor="contact-last">שם משפחה</label>
                <input id="contact-last" type="text" placeholder="כהן" />
              </div>
            </div>
            <div className="field-group" style={{ marginBottom: 16 }}>
              <label htmlFor="contact-phone">טלפון</label>
              <input id="contact-phone" type="tel" placeholder="050-0000000" inputMode="tel" />
            </div>
            <div className="field-group" style={{ marginBottom: 16 }}>
              <label htmlFor="contact-email">מייל</label>
              <input id="contact-email" type="text" placeholder="rachel@gmail.com" inputMode="email" dir="ltr" />
            </div>
            <div className="field-group" style={{ marginBottom: 16 }}>
              <label htmlFor="contact-subject">נושא הפנייה</label>
              <select id="contact-subject" defaultValue="">
                <option value="">שאלה כללית</option>
                <option value="pickup">תיאום איסוף</option>
                <option value="order">בעיה בהזמנה</option>
                <option value="partner">שיתוף פעולה</option>
                <option value="other">אחר</option>
              </select>
            </div>
            <div className="field-group" style={{ marginBottom: 20 }}>
              <label htmlFor="contact-msg">הודעה</label>
              <textarea id="contact-msg" placeholder="כתבו לנו..." style={{ minHeight: 120 }} />
            </div>
            <button type="button" className="btn-primary-purple" style={{ width: "100%", justifyContent: "center" }}>
              שלחו הודעה ←
            </button>
          </div>

          <div className="hc-contact-chips">
            <div
              style={{
                background: "#fff",
                borderRadius: "var(--radius-sm)",
                padding: 20,
                textAlign: "center",
                border: "1px solid rgba(243, 232, 255, 0.7)",
              }}
            >
              <div style={{ fontSize: "1.5rem", marginBottom: 8 }}>📧</div>
              <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#111827", marginBottom: 4 }}>אימייל</div>
              <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>hello@nifradim.co.il</div>
            </div>
            <div
              style={{
                background: "#fff",
                borderRadius: "var(--radius-sm)",
                padding: 20,
                textAlign: "center",
                border: "1px solid rgba(243, 232, 255, 0.7)",
              }}
            >
              <div style={{ fontSize: "1.5rem", marginBottom: 8 }}>📱</div>
              <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#111827", marginBottom: 4 }}>וואטסאפ</div>
              <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>050-000-0000</div>
            </div>
          </div>
        </div>
      </section>

      <section className="testimonials-section">
        <div className="testimonials-inner">
          <div className="testi-header hc-stack hc-stack--center hc-prose">
            <span className="section-label hc-testi-label">מה אומרים עלינו</span>
            <h2 className="section-title">אלפי משפחות כבר חייכו</h2>
          </div>
          <div className="testi-cards">
            <div className="testi-card">
              <div className="testi-stars">★★★★★</div>
              <p className="testi-quote">
                &quot;הבן שלי בכה כשנפרד מהדוב. וכשקיבל את התמונה של הילד שמחזיק אותו החיוך שלו היה שווה הכל.&quot;
              </p>
              <div className="testi-author">
                <div className="testi-avatar ta-1">👩</div>
                <div>
                  <div className="testi-name">נועה כהן</div>
                  <div className="testi-role">אמא לשניים, תל אביב</div>
                </div>
              </div>
            </div>
            <div className="testi-card">
              <div className="testi-stars">★★★★★</div>
              <p className="testi-quote">
                &quot;המכתב של ה-AI היה כל כך אנושי ומרגש. ילדתי ביקשה לשמוע אותו שלוש פעמים לפני השינה. מדהים.&quot;
              </p>
              <div className="testi-author">
                <div className="testi-avatar ta-2">👨</div>
                <div>
                  <div className="testi-name">אלון לוי</div>
                  <div className="testi-role">אב לבת אחת, ירושלים</div>
                </div>
              </div>
            </div>
            <div className="testi-card">
              <div className="testi-stars">★★★★★</div>
              <p className="testi-quote">
                &quot;תרמנו שקית שלמה של צעצועים. השליח היה כל כך נחמד, האיסוף לקח 10 דקות. ממליצה בחום לכולם!&quot;
              </p>
              <div className="testi-author">
                <div className="testi-avatar ta-3">👩</div>
                <div>
                  <div className="testi-name">מיכל ברק</div>
                  <div className="testi-role">אמא לשלושה, חיפה</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
