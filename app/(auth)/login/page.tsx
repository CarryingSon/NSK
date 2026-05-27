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
      <div className="surface-glass grid w-full max-w-5xl overflow-hidden rounded-[2.5rem] border border-white/60 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="relative hidden bg-[radial-gradient(circle_at_top_left,rgba(243,103,23,0.16),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(46,49,146,0.18),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.9),rgba(248,250,252,0.78))] px-10 py-12 lg:flex lg:flex-col lg:justify-between">
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
              Poziralnik za interno vodenje članstva in dogodkov
            </h1>
            <p className="mt-5 max-w-md text-base leading-7 text-muted-foreground">
              Usklajen administratorski portal za člansko ekipo NSK kluba, prijave,
              obveščanje, kupončke in evidenco operativnega dela.
            </p>
          </div>

          <div className="rounded-[2rem] border border-primary/10 bg-white/92 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
            <div className="flex items-center gap-4">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/12 text-primary">
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

        <section className="bg-white/82 px-6 py-10 sm:px-10 sm:py-12">
          <div className="mx-auto max-w-md">
            <div className="flex size-16 items-center justify-center rounded-3xl bg-[linear-gradient(135deg,#f36717_0%,#d95d13_100%)] shadow-[0_18px_34px_rgba(243,103,23,0.24)]">
              <ShieldCheck className="size-7 text-white" />
            </div>
            <Image
              src="/nsk-logo.svg"
              alt="NSK Klub"
              width={352}
              height={66}
              className="mt-6 h-10 w-auto"
            />
            <p className="mt-6 text-sm font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              {appName}
            </p>
            <h2 className="mt-3 font-heading text-4xl font-semibold text-foreground">
              Prijava v sistem
            </h2>
            <p className="mt-3 text-base text-muted-foreground">
              Prijavi se z e-pošto in geslom, da dostopaš do nadzorne plošče.
            </p>

            {!configured ? (
              <div className="mt-8 rounded-[1.5rem] border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
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
