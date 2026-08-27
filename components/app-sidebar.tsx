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
    <div className="surface-sidebar flex h-full flex-col px-4 py-6 text-sidebar-foreground">
      <div className="px-2">
        <Image
          src="/nsk-logo.svg"
          alt="NSK Klub"
          width={352}
          height={66}
          className="h-7 w-auto dark:brightness-0 dark:invert"
        />
        <h2 className="mt-4 font-heading text-[1.375rem] font-semibold tracking-[-0.02em]">
          {appName}
        </h2>
        <p className="mt-1 text-[0.8125rem] leading-5 text-muted-foreground">
          Interni klubski portal
        </p>

        {demoMode ? (
          <div className="mt-4 rounded-[12px] border border-warning/25 bg-warning/10 px-3 py-2 text-[0.8125rem] text-warning">
            Demo prikaz brez povezane Supabase instance.
          </div>
        ) : null}
      </div>

      <nav className="mt-8 flex-1 space-y-0.5">
        {primaryNavigation.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-[10px] px-3 py-2 text-[0.9375rem] text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground",
                isActive &&
                  "bg-sidebar-accent font-medium text-sidebar-foreground",
              )}
            >
              <item.icon
                className={cn("size-[1.125rem]", isActive && "text-primary")}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-6 border-t border-sidebar-border pt-5">
        <div className="flex items-center gap-3 px-1">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-[0.8125rem] font-medium text-primary-foreground">
            {getInitials(email ?? appName)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-[0.8125rem] text-muted-foreground">
              {demoMode ? "Demo način" : "Prijavljen"}
            </p>
            <p className="truncate text-[0.875rem] font-medium">
              {email ?? "Brez aktivne prijave"}
            </p>
          </div>
        </div>

        <form action={logoutAction} className="mt-4">
          <SubmitButton
            type="submit"
            variant="outline"
            pendingLabel="Odjavljam ..."
            className="h-10 w-full justify-center"
          >
            <logoutItem.icon className="size-4" />
            {logoutItem.label}
          </SubmitButton>
        </form>
      </div>
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
            <Button variant="outline" size="icon-lg" className="rounded-full" />
          }
        >
          <Menu className="size-5" />
          <span className="sr-only">Odpri navigacijo</span>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="w-[85vw] max-w-[20rem] border-r border-sidebar-border bg-sidebar p-0"
          showCloseButton={false}
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Glavna navigacija</SheetTitle>
            <SheetDescription>
              Dostop do modulov aplikacije Poziralnik.
            </SheetDescription>
          </SheetHeader>
          <SidebarBody email={email} demoMode={demoMode} />
        </SheetContent>
      </Sheet>
    );
  }

  return <SidebarBody email={email} demoMode={demoMode} />;
}

export { buttonVariants };
