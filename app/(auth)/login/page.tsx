import Image from "next/image";
import { ShieldCheck } from "lucide-react";

import { LoginForm } from "@/components/forms/login-form";
import { appName } from "@/lib/constants";
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
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-16">
      <div className="surface-card grid w-full max-w-5xl overflow-hidden rounded-[18px] border border-border lg:grid-cols-[1.1fr_0.9fr]">
        <section className="surface-muted relative hidden border-r border-border px-10 py-12 lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="brand-chip">Interni klubski sistem</div>
            <Image
              src="/nsk-logo.svg"
              alt="NSK Klub"
              width={352}
              height={66}
              className="mt-8 h-11 w-auto"
            />
            <h1 className="mt-6 max-w-md font-heading text-5xl font-semibold leading-tight text-foreground">
              Poziralnik za interno vodenje članstva in obveščanja
            </h1>
            <p className="mt-5 max-w-md text-base leading-7 text-muted-foreground">
              Usklajen administratorski portal za člansko ekipo NSK kluba,
              evidenco tiska, obveščanje in osnovno administracijo.
            </p>
          </div>

          <div className="rounded-[18px] border border-primary/10 bg-card p-6">
            <div className="flex items-center gap-4">
              <div className="flex size-14 items-center justify-center rounded-xl bg-primary/12 text-primary">
                <ShieldCheck className="size-7" />
              </div>
              <div>
                <p className="font-heading text-2xl font-semibold text-foreground">
                  Samo za interno uporabo
                </p>
                <p className="text-sm text-muted-foreground">
                  Dostop imajo samo prijavljeni uporabniki z ustreznimi pravicami.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-card px-6 py-10 sm:px-10 sm:py-12">
          <div className="mx-auto max-w-md">
            <div className="flex size-16 items-center justify-center rounded-[18px] bg-primary">
              <ShieldCheck className="size-7 text-primary-foreground" />
            </div>
            <Image
              src="/nsk-logo.svg"
              alt="NSK Klub"
              width={352}
              height={66}
              className="mt-6 h-10 w-auto lg:hidden"
            />
            <p className="mt-6 text-sm font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              {appName}
            </p>
            <h2 className="mt-3 font-heading text-4xl font-semibold text-foreground">
              Prijava v sistem
            </h2>
            <p className="mt-3 text-base text-muted-foreground">
              Prijavi se z e-pošto in geslom, da dostopaš do internega portala.
            </p>

            {!configured ? (
              <div className="mt-8 rounded-[14px] border border-warning/25 bg-warning/10 px-5 py-4 text-sm text-warning">
                Supabase še ni nastavljen. Dodaj okoljski spremenljivki
                <span className="mx-1 font-mono">NEXT_PUBLIC_SUPABASE_URL</span> in
                <span className="mx-1 font-mono">NEXT_PUBLIC_SUPABASE_ANON_KEY</span>,
                nato ponovno zaženi aplikacijo.
              </div>
            ) : null}

            <div className="mt-8">
              <LoginForm redirectTo={redirectedFrom} disabled={!configured} />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
