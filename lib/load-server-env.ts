import { loadEnvConfig } from "@next/env";

let loaded = false;

const silentLog = { info: () => {}, error: console.error };

/**
 * טוען במפורש את קבצי הסביבה של Next (כולל .env.local) לתוך process.env.
 * פרמטר dev תואם למצב פיתוח כדי לטעון את קבצי ה-env הנכונים.
 */
export function loadServerEnvOnce(): void {
  if (loaded) return;
  loaded = true;
  try {
    const isDev = process.env.NODE_ENV !== "production";
    loadEnvConfig(process.cwd(), isDev, silentLog);
  } catch {
    /* בבנייה סטטית או סביבות חריגות */
  }
}
