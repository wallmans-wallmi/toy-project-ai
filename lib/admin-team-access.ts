import type { SupabaseClient } from "@supabase/supabase-js";
import type { AdminSessionInfo } from "@/lib/admin-auth";

/** ניהול צוות: אדמין לוגיסטיקה או superadmin בחשבון */
export async function canAccessTeamManagement(
  supabase: SupabaseClient,
  session: AdminSessionInfo | null,
): Promise<boolean> {
  if (!session) return false;
  if (session.role === "admin") return true;
  if (session.kind === "v2" && session.sub !== "legacy") {
    const { data } = await supabase.from("admin_users").select("role").eq("id", session.sub).maybeSingle();
    return data?.role === "superadmin";
  }
  return false;
}

export type AccountRole = "admin" | "superadmin";

export async function getAccountRoleForUser(
  supabase: SupabaseClient,
  userId: string,
): Promise<AccountRole> {
  const { data } = await supabase.from("admin_users").select("role").eq("id", userId).maybeSingle();
  return data?.role === "superadmin" ? "superadmin" : "admin";
}
