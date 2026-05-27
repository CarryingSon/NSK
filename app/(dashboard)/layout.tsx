import type { ReactNode } from "react";

import { AppShell } from "@/components/app-shell";
import { requireUser } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requireUser();

  return (
    <AppShell email={user?.email ?? null} demoMode={!isSupabaseConfigured()}>
      {children}
    </AppShell>
  );
}
