import { Suspense } from "react";
import { redirect } from "next/navigation";
import { PortalLoginForm } from "@/components/portal/portal-login-form";
import { createClient } from "@/lib/supabase/server";

export default async function AccountLoginPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    redirect("/account/dashboard");
  }

  return (
    <div className="mx-auto max-w-[500px] px-4 py-10 sm:py-16">
      <Suspense
        fallback={
          <div className="flex min-h-[20vh] items-center justify-center text-sm text-slate-600" dir="rtl" lang="he">
            טוענים…
          </div>
        }
      >
        <PortalLoginForm />
      </Suspense>
    </div>
  );
}
