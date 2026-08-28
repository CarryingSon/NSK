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

  // Brez Supabase teče aplikacija v predstavitvenem načinu; takrat ni vloge in
  // se pokaže vse, sicer bi bil demo prazen.

  return (
    <AppShell
      email={user?.email ?? null}
      demoMode={!isSupabaseConfigured()}
      role={user?.role ?? "admin"}
    >
      {children}
    </AppShell>
  );
}
