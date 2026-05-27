import { Cog, ShieldCheck, Workflow } from "lucide-react";

import { PageHeader } from "@/components/page-header";

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Nastavitve"
        description="Osnovna konfiguracija aplikacije in operativni opomniki za ekipo."
      />

      <section className="grid gap-6 lg:grid-cols-3">
        {[
          {
            icon: Cog,
            title: "Splošne nastavitve",
            text: "Pripravljeno za prihodnje nastavitve blagovne znamke, privzetih polj in internih pravil.",
          },
          {
            icon: ShieldCheck,
            title: "Dostopi",
            text: "Supabase Auth skrbi za prijavo, RLS pa za osnovno zaščito podatkov za prijavljene uporabnike.",
          },
          {
            icon: Workflow,
            title: "Poteki dela",
            text: "Tu lahko kasneje dodaš avtomatizacije za potrjevanje članstva, obveščanje in poročanje.",
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
