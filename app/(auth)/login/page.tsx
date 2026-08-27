import Image from "next/image";

import { LoginForm } from "@/components/forms/login-form";
import { isSupabaseConfigured } from "@/lib/supabase/env";

interface LoginPageProps {
  searchParams: Promise<{
    redirectedFrom?: string;
  }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { redirectedFrom } = await searchParams;
  const configured = isSupabaseConfigured();

  return (
    <main className="login-canvas relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-16">
      {/* Trije počasni krogi v klubski oranžni. Ozadje samo diha - brez lika,
          ker NŠK maskote nima in si je ne gre izmišljati. */}
      <span aria-hidden className="login-orb login-orb-1" />
      <span aria-hidden className="login-orb login-orb-2" />
      <span aria-hidden className="login-orb login-orb-3" />

      <div className="relative w-full max-w-[26rem]">
        <div className="login-card rounded-[26px] p-8 sm:p-10">
          <Image
            src="/nsk-logo.svg"
            alt="Notranjski študentski klub"
            width={352}
            height={66}
            priority
            className="mx-auto h-10 w-auto"
          />

          <p className="mt-7 text-center text-[1.0625rem] leading-relaxed text-muted-foreground">
            Prijavite se v sistem za vodenje članstva
          </p>

          <div className="mt-8">
            <LoginForm redirectTo={redirectedFrom} disabled={!configured} />
          </div>

          {!configured ? (
            <p className="mt-6 rounded-[12px] border border-warning/25 bg-warning/10 px-4 py-3 text-center text-[0.875rem] text-warning">
              Supabase ni konfiguriran, zato prijava trenutno ni mogoča.
            </p>
          ) : null}
        </div>

        <p className="mt-6 text-center text-[0.8125rem] text-muted-foreground">
          Interni portal Notranjskega študentskega kluba
        </p>
      </div>
    </main>
  );
}
