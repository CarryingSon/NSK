"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

import { logoutAction } from "@/app/actions/auth";
import { SubmitButton } from "@/components/forms/submit-button";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { appName, logoutItem, primaryNavigation } from "@/lib/constants";
import { getInitials } from "@/lib/format";
import { cn } from "@/lib/utils";

function SidebarBody({
  email,
  demoMode,
}: {
  email: string | null;
  demoMode: boolean;
}) {
  const pathname = usePathname();

  return (
    <div className="surface-sidebar flex h-full flex-col rounded-[2rem] border border-white/60 px-5 py-6">
      <div className="mb-8 px-2">
        <div className="inline-flex rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Interni sistem
        </div>
        <h2 className="mt-4 font-heading text-4xl font-semibold text-foreground">
          {appName}
        </h2>
        <p className="mt-2 max-w-xs text-sm text-muted-foreground">
          Članstvo, prijave, dogodki in osnovna administracija na enem mestu.
        </p>
        {demoMode ? (
          <div className="mt-4 rounded-2xl border border-dashed border-primary/40 bg-primary/10 px-4 py-3 text-sm text-foreground">
            Demo prikaz brez povezane Supabase instance.
          </div>
        ) : null}
      </div>

      <nav className="flex-1 space-y-2">
        {primaryNavigation.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-muted-foreground transition hover:bg-white/75 hover:text-foreground",
                isActive && "bg-white/90 text-foreground shadow-sm ring-1 ring-primary/20",
              )}
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-6 rounded-[1.75rem] border border-white/70 bg-white/75 p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-primary text-sm font-semibold text-primary-foreground">
            {getInitials(email ?? appName)}
          </div>
          <div className="min-w-0">
            <p className="truncate font-semibold text-foreground">
              {demoMode ? "Demo način" : "Prijavljen uporabnik"}
            </p>
            <p className="truncate text-sm text-muted-foreground">
              {email ?? "Brez aktivne prijave"}
            </p>
          </div>
        </div>
      </div>

      <form action={logoutAction} className="mt-4">
        <SubmitButton
          type="submit"
          variant="outline"
          pendingLabel="Odjavljam ..."
          className="h-12 w-full justify-center rounded-2xl border-white/70 bg-white/80 text-foreground shadow-sm"
        >
          <logoutItem.icon className="size-4" />
          {logoutItem.label}
        </SubmitButton>
      </form>
    </div>
  );
}

export function AppSidebar({
  email,
  demoMode,
  mobile = false,
}: {
  email: string | null;
  demoMode: boolean;
  mobile?: boolean;
}) {
  if (mobile) {
    return (
      <Sheet>
        <SheetTrigger
          render={
            <Button
              variant="outline"
              size="icon-lg"
              className="rounded-2xl border-white/70 bg-white/80"
            />
          }
        >
          <Menu className="size-5" />
          <span className="sr-only">Odpri navigacijo</span>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="w-[90vw] max-w-[23rem] border-r border-white/50 bg-transparent p-0 shadow-none"
          showCloseButton={false}
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Glavna navigacija</SheetTitle>
            <SheetDescription>Dostop do modulov aplikacije Poziralnik.</SheetDescription>
          </SheetHeader>
          <div className="h-full p-4">
            <SidebarBody email={email} demoMode={demoMode} />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return <SidebarBody email={email} demoMode={demoMode} />;
}

export { buttonVariants };
