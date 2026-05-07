/**
 * PostgREST מחזיר 404 או קודים מסוימים כשטבלה לא קיימת ב־schema cache (לפני reload),
 * או כשהמשאב לא נחשף ל־API.
 */
export function isPostgrestMissingResourceError(err: {
  message?: string;
  code?: string;
  status?: number;
  details?: string;
} | null | undefined): boolean {
  if (!err) return false;
  const msg = String(err.message ?? "").toLowerCase();
  const details = String(err.details ?? "").toLowerCase();
  const code = String(err.code ?? "");
  const status = typeof err.status === "number" ? err.status : 0;

  if (status === 404) return true;
  if (code === "42P01") return true;
  if (code === "PGRST205") return true;
  if (msg.includes("schema cache")) return true;
  if (msg.includes("could not find the table")) return true;
  if (msg.includes("does not exist") && (msg.includes("relation") || msg.includes("table"))) return true;
  if (details.includes("does not exist")) return true;
  return false;
}
