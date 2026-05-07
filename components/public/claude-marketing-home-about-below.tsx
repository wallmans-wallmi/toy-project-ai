/** About, contact, and testimonials blocks for the Claude-style marketing home page. */

export function ClaudeMarketingHomeAboutBelow() {
  return (
    <>
      <section id="about">
        <div className="hc-layout-inner hc-about-inner">
          <div className="hc-stack hc-prose">
            <span className="section-label">מי אנחנו</span>
            <h2 className="hc-about-title">נולדנו מתוך חוויה אמיתית</h2>
            <p className="section-sub hc-about-lead">
              כשרוצים לעזור לילד לגדול בצורה בריאה ושמחה, לא תמיד קל לדעת איך לעשות את זה נכון. פרידה מצעצועים אהובים יכולה להיות קשה, ואנחנו כאן בדיוק כדי להפוך אותה לחגיגה.
            </p>
          </div>

          <div className="hc-about-vision">
            <h3 className="hc-about-vision-title">החזון שלנו</h3>
            <p className="hc-about-vision-text">
              עולם שבו כל שלב גדילה של ילד הוא רגע של גאווה ולא של אובדן. אנחנו מאמינים שפרידה נכונה מצעצועים יכולה לבנות ביטחון, נדיבות ואמפתיה אצל הילדים.
            </p>
          </div>

          <div className="about-stats-grid hc-about-stats">
            <div style={{ textAlign: "center", background: "white", borderRadius: "var(--radius-sm)", padding: 24 }}>
              <div style={{ fontSize: "2rem", marginBottom: 8 }}>💜</div>
              <div style={{ fontSize: "1.5rem", fontWeight: 900, color: "#9333EA" }}>2,400+</div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: 4 }}>צעצועים נמסרו</div>
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
                    צעצועים שעבר זמנם ממשיכים לשמח ילדים אחרים
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
