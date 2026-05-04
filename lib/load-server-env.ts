import { loadEnvConfig } from "@next/env";

let loaded = false;

const silentLog = { info: () => {}, error: console.error };

/**
 * טוען במפורש את קבצי הסביבה של Next (כולל .env.local) לתוך process.env.
 * פרמטר dev תואם למצב פיתוח כדי לטעון את קבצי ה-env הנכונים.
 * רק אחרי טעינה מוצלחת מסמנים loaded — כדי לא לנעול 503 אם הייתה תקלה חד־פעמית.
 */
export function loadServerEnvOnce(): void {
  if (loaded) return;
  try {
    const isDev = process.env.NODE_ENV !== "production";
    loadEnvConfig(process.cwd(), isDev, silentLog);
    loaded = true;
  } catch (err) {
    console.error("[נפרדים בחיוך] loadServerEnvOnce: טעינת קבצי env נכשלה, ננסה שוב בבקשה הבאה.", err);
  }
}
