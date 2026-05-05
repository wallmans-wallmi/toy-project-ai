/** תאריך מקומי YYYY-MM-DD לפי ישראל — לסינון איסופי היום */
export function todayDateIsrael(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jerusalem",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}
