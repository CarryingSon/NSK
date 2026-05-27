import type { ReactNode } from "react";

import { AppSidebar } from "@/components/app-sidebar";

export function AppShell({
  children,
  email,
  demoMode,
}: {
  children: ReactNode;
  email: string | null;
  demoMode: boolean;
}) {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[300px_minmax(0,1fr)]">
      <aside className="hidden p-4 lg:block lg:p-5">
        <div className="sticky top-5 h-[calc(100vh-2.5rem)]">
          <AppSidebar email={email} demoMode={demoMode} />
        </div>
      </aside>

      <div className="min-w-0 px-4 pb-10 pt-4 lg:px-6 lg:pb-12 lg:pt-6">
        <div className="mb-5 flex items-center justify-between lg:hidden">
          <AppSidebar email={email} demoMode={demoMode} mobile />
          <div className="rounded-full border border-white/70 bg-white/75 px-4 py-2 text-sm text-muted-foreground shadow-sm">
            {demoMode ? "Demo pogled" : email ?? "Poziralnik"}
          </div>
        </div>

        {demoMode ? (
          <div className="surface-glass mb-6 rounded-[1.75rem] border border-white/60 px-5 py-4 text-sm text-foreground">
            Supabase ni konfiguriran, zato aplikacija prikazuje prazna stanja brez shranjevanja podatkov.
          </div>
        ) : null}

        {children}
      </div>
    </div>
  );
}
