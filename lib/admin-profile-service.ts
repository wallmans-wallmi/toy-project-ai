import type { SupabaseClient } from "@supabase/supabase-js";
import type { AdminDashboardRole } from "@/lib/admin-role-types";

export async function getLogisticsRoleForUser(
  supabase: SupabaseClient,
  userId: string,
): Promise<AdminDashboardRole> {
  const { data, error } = await supabase.from("admin_profiles").select("role").eq("user_id", userId).maybeSingle();
  if (error) {
    console.error("[admin_profiles]", error.message);
    return "admin";
  }
  const r = data?.role;
  if (r === "office" || r === "driver") return r;
  return "admin";
}

export async function upsertAdminProfile(
  supabase: SupabaseClient,
  userId: string,
  role: AdminDashboardRole = "admin",
): Promise<void> {
  await supabase.from("admin_profiles").upsert({ user_id: userId, role }, { onConflict: "user_id" });
}
