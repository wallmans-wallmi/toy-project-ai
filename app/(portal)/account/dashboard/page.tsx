import { Suspense } from "react";
import { redirect } from "next/navigation";
import { PortalDashboardClient } from "@/components/portal/portal-dashboard-client";
import { createClient } from "@/lib/supabase/server";

export default async function AccountDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/account/login");
  }
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[30vh] items-center justify-center text-sm text-slate-600" dir="rtl" lang="he">
          טוענים…
        </div>
      }
    >
      <PortalDashboardClient />
    </Suspense>
  );
}
