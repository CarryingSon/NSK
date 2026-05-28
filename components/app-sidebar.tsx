"use client";

import Image from "next/image";
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
    <div className="surface-sidebar flex h-full flex-col rounded-[2rem] border border-white/10 px-5 py-6 text-sidebar-foreground">
      <div className="mb-8 px-1">
        <div className="inline-flex rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/72">
          NSK klub
        </div>
        <div className="mt-5 rounded-[1.75rem] border border-white/10 bg-white px-4 py-4 shadow-[0_18px_40px_rgba(15,23,42,0.18)]">
          <Image
            src="/nsk-logo.svg"
            alt="NSK Klub"
            width={352}
            height={66}
            className="h-9 w-auto"
          />
          <div className="mt-4 h-px bg-gradient-to-r from-[#f36717] via-[#f7c3a2] to-transparent" />
          <h2 className="mt-4 font-heading text-3xl font-semibold text-[#182168]">
            {appName}
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Interni portal za članstvo, evidenco tiska, obveščanje in osnovno
            klubsko administracijo.
          </p>
        </div>
        {demoMode ? (
          <div className="mt-4 rounded-2xl border border-dashed border-white/20 bg-white/10 px-4 py-3 text-sm text-white/82">
            Demo prikaz brez povezane Supabase instance.
          </div>
        ) : null}
      </div>

      <nav className="flex-1 space-y-2">
        {primaryNavigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-white/72 transition hover:bg-white/10 hover:text-white",
                isActive &&
                  "bg-white text-[#182168] shadow-[0_16px_30px_rgba(15,23,42,0.18)] ring-1 ring-white/30",
              )}
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-6 rounded-[1.75rem] border border-white/10 bg-white/10 p-4 shadow-[0_10px_24px_rgba(15,23,42,0.15)]">
        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-primary text-sm font-semibold text-primary-foreground">
            {getInitials(email ?? appName)}
          </div>
          <div className="min-w-0">
            <p className="truncate font-semibold text-white">
              {demoMode ? "Demo način" : "Prijavljen uporabnik"}
            </p>
            <p className="truncate text-sm text-white/72">
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
          className="h-12 w-full justify-center rounded-2xl border-white/10 bg-white/10 text-white shadow-[0_10px_24px_rgba(15,23,42,0.15)] hover:bg-white/14"
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
              className="rounded-2xl border-white/10 bg-[#182168] text-white shadow-[0_12px_28px_rgba(24,33,104,0.28)] hover:bg-[#222b86]"
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
