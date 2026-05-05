/** שגיאת Postgres/PostgREST — עמודה לא קיימת בטבלה (למשל לפני מיגרציית username) */
export function isUndefinedColumnError(err: { message?: string; code?: string } | null | undefined): boolean {
  if (!err) return false;
  const m = (err.message ?? "").toLowerCase();
  const c = err.code ?? "";
  return c === "42703" || m.includes("does not exist") || m.includes("column") && m.includes("username");
}
