import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AccountIndexPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  redirect(user ? "/account/dashboard" : "/account/login");
}
