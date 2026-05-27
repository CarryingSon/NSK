import { Database, LayoutDashboard, Shield, Sparkles } from "lucide-react";

import { PageHeader } from "@/components/page-header";

export default function InfoPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Info"
        description="Pregled arhitekture in glavnih modulov aplikacije Poziralnik."
      />

      <section className="grid gap-6 lg:grid-cols-2">
        {[
          {
            icon: LayoutDashboard,
            title: "Administracijski UX",
            text: "Aplikacija temelji na Next.js App Router arhitekturi z ločenim loginom, zaščitenim shellom in preglednim dashboard tokom.",
          },
          {
            icon: Database,
            title: "Podatkovni sloj",
            text: "Supabase poganja bazo, avtentikacijo in RLS politike za tabele members, events, event_registrations, coupons in print_records.",
          },
          {
            icon: Shield,
            title: "Varnost",
            text: "Ko je Supabase konfiguriran, middleware in RLS zagotavljata, da do podatkov dostopajo samo prijavljeni uporabniki.",
          },
          {
            icon: Sparkles,
            title: "Pripravljen za rast",
            text: "Komponente, akcije in podatkovni helperji so modularni, zato lahko brez večjih posegov dodaš dodatne module ali poročila.",
          },
        ].map((item) => (
          <div
            key={item.title}
            className="surface-glass rounded-[2rem] border border-white/60 p-6"
          >
            <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/12 text-primary">
              <item.icon className="size-5" />
            </div>
            <h2 className="mt-5 font-heading text-2xl font-semibold text-foreground">
              {item.title}
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {item.text}
            </p>
          </div>
        ))}
      </section>
    </div>
  );
}
