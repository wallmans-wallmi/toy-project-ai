import type { AdminDashboardRole } from "@/lib/admin-role-types";

export type TeamMemberRow = {
  id: string;
  email: string;
  account_role: string;
  logistics_role: AdminDashboardRole;
  created_at: string;
};
