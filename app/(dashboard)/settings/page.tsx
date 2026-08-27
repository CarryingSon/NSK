import { Cog, Mail, ShieldCheck, Workflow } from "lucide-react";

import { PrintQuotaForm } from "@/components/forms/print-quota-form";
import { PageHeader } from "@/components/page-header";
import { getPrintMonthlyQuota } from "@/lib/data";
import { isEmailConfigured } from "@/lib/supabase/env";

export default async function SettingsPage() {
  const emailConfigured = isEmailConfigured();
  const quota = await getPrintMonthlyQuota();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Nastavitve"
        description="Osnovna konfiguracija aplikacije in operativni opomniki za ekipo."
      />

      <section className="surface-card rounded-[18px] p-6 sm:p-8">
        <h2 className="font-heading text-2xl font-semibold tracking-[-0.02em]">
          Mesečna kvota kopij
        </h2>
        <p className="mt-2 max-w-2xl text-[0.9375rem] leading-relaxed text-muted-foreground">
          Koliko kopij ima posamezen član na voljo v enem mesecu. Vrednost se
          uporablja za stolpec &bdquo;Preostalo&ldquo; in za skupno kvoto v
          evidenci tiska.
        </p>
        <div className="mt-6">
          <PrintQuotaForm quota={quota} />
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-4">
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
            icon: Mail,
            title: "Email povezava",
            text: emailConfigured
              ? "SMTP povezava je zaznana in pripravljena za pošiljanje obvestil članom."
              : "Nastavi SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS in SMTP_FROM v `.env.local`, da omogočiš pošiljanje obvestil.",
          },
          {
            icon: Workflow,
            title: "Poteki dela",
            text: "Tu lahko kasneje dodaš avtomatizacije za potrjevanje članstva, obveščanje in poročanje.",
          },
        ].map((item) => (
          <div
            key={item.title}
            className="surface-card rounded-[18px] border border-border p-6"
          >
            <div className="flex size-12 items-center justify-center rounded-xl bg-primary/12 text-primary">
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
