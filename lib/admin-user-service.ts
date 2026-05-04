import type { SupabaseClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

export function normalizeAdminEmail(email: string): string {
  return email.replace(/^\uFEFF/, "").trim().toLowerCase();
}

export async function countAdminUsers(supabase: SupabaseClient): Promise<number | null> {
  const { count, error } = await supabase.from("admin_users").select("*", { count: "exact", head: true });
  if (error) {
    console.error("[נפרדים בחיוך] countAdminUsers:", error.message);
    return null;
  }
  return count ?? 0;
}

export async function verifyAdminUserPassword(
  supabase: SupabaseClient,
  email: string,
  plainPassword: string,
): Promise<{ id: string; email: string; role: string } | null> {
  const normalized = normalizeAdminEmail(email);
  if (!normalized || !plainPassword) return null;
  const { data, error } = await supabase
    .from("admin_users")
    .select("id, email, password_hash, role")
    .eq("email", normalized)
    .maybeSingle();
  if (error || !data?.password_hash) return null;
  const ok = await bcrypt.compare(plainPassword, data.password_hash);
  if (!ok) return null;
  return { id: data.id, email: data.email, role: data.role };
}

export function hashAdminPassword(plain: string): string {
  return bcrypt.hashSync(plain, 10);
}
