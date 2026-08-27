import type { ReactNode } from "react";

import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";

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
    <div className="min-h-screen lg:grid lg:grid-cols-[17rem_minmax(0,1fr)]">
      {/* Stranska vrstica sega od roba do roba, brez lebdenja - ločuje jo samo
          tanka črta, kot Apple loči odseke. */}
      <aside className="hidden lg:block">
        <div className="sticky top-0 h-screen overflow-y-auto">
          <AppSidebar email={email} demoMode={demoMode} />
        </div>
      </aside>

      <div className="min-w-0">
        <div className="nav-blur sticky top-0 z-40 flex items-center justify-between gap-3 border-b border-border px-4 py-3 lg:hidden">
          <AppSidebar email={email} demoMode={demoMode} mobile />
          <div className="flex min-w-0 items-center gap-3">
            <span className="hidden truncate text-[0.875rem] text-muted-foreground sm:block">
              {demoMode ? "Demo pogled" : email ?? "Poziralnik"}
            </span>
            <ThemeToggle />
          </div>
        </div>

        <main className="mx-auto w-full max-w-[76rem] px-5 pb-24 pt-8 sm:px-8 lg:px-12 lg:pt-10">
          <div className="mb-6 hidden justify-end lg:flex">
            <ThemeToggle />
          </div>

          {demoMode ? (
            <div className="mb-8 rounded-[14px] border border-warning/25 bg-warning/10 px-4 py-3 text-[0.9375rem] text-warning">
              Supabase ni konfiguriran, zato aplikacija prikazuje prazna stanja
              brez shranjevanja podatkov.
            </div>
          ) : null}

          {children}
        </main>
      </div>
    </div>
  );
}
