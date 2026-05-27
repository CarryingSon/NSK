import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export default async function HomePage() {
  if (!isSupabaseConfigured()) {
    redirect("/dashboard");
  }

  const user = await getCurrentUser();

  redirect(user ? "/dashboard" : "/login");
}
