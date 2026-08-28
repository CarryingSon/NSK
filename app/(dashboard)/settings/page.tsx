import { Cog, Mail, ShieldCheck, TriangleAlert, Users, Workflow } from "lucide-react";

import { PrintQuotaForm } from "@/components/forms/print-quota-form";
import { InviteUserForm } from "@/components/settings/invite-user-form";
import { UserRowActions } from "@/components/settings/user-row-actions";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { getPrintMonthlyQuota } from "@/lib/data";
import { appRoleLabels } from "@/lib/roles";
import { getAppUsers } from "@/lib/users";
import { formatDateTime } from "@/lib/format";
import { isEmailConfigured, isUserManagementConfigured } from "@/lib/supabase/env";
import { requireAdmin } from "@/lib/auth";

export default async function SettingsPage() {
  const current = await requireAdmin();
  const userManagementReady = isUserManagementConfigured();

  const emailConfigured = isEmailConfigured();
  const [quota, users] = await Promise.all([
    getPrintMonthlyQuota(),
    getAppUsers(),
  ]);

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


      <section className="surface-card rounded-[18px] p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary">
            <Users className="size-5" />
          </div>
          <div>
            <h2 className="font-heading text-2xl font-semibold tracking-[-0.02em]">
              Uporabniki aplikacije
            </h2>
            <p className="mt-1 text-[0.9375rem] leading-relaxed text-muted-foreground">
              Administrator vidi in ureja vse. Uradnik vidi samo člane in
              evidenco tiska.
            </p>
          </div>
        </div>

        {!userManagementReady ? (
          <div className="mt-6 flex items-start gap-3 rounded-[14px] border border-warning/25 bg-warning/10 px-5 py-4 text-sm text-warning">
            <TriangleAlert className="mt-0.5 size-4 shrink-0" />
            <div>
              <p className="font-semibold">
                Upravljanje uporabnikov še ni nastavljeno
              </p>
              <p className="mt-1">
                Dodaj SUPABASE_SERVICE_ROLE_KEY med spremenljivke okolja -
                lokalno v .env.local, na Vercelu med nastavitve projekta. Ključ
                najdeš v Supabase pod Project Settings &rarr; API. Ker obide vsa
                RLS pravila, ne sme nikoli imeti predpone NEXT_PUBLIC.
              </p>
            </div>
          </div>
        ) : null}

        <div className="mt-7 border-t border-border pt-6">
          <h3 className="text-sm font-semibold text-foreground">
            Povabi novega uporabnika
          </h3>
          <p className="mt-1 mb-5 text-xs leading-5 text-muted-foreground">
            Povabljeni po e-pošti dobi povezavo, prek katere si sam nastavi
            geslo. Gesla ne določaš ti in ga tudi ne vidiš.
          </p>
          <InviteUserForm disabled={!userManagementReady} />
        </div>

        {users.length > 0 ? (
          <div className="mt-8 border-t border-border pt-6">
            <h3 className="mb-4 text-sm font-semibold text-foreground">
              Obstoječi uporabniki ({users.length})
            </h3>
            <ul className="space-y-3">
              {users.map((user) => (
                <li
                  key={user.id}
                  className="flex flex-col gap-3 rounded-[14px] border border-border bg-card px-4 py-3.5 lg:flex-row lg:items-center lg:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate font-medium text-foreground">
                        {user.email}
                      </p>
                      {user.id === current?.id ? (
                        <Badge variant="secondary">Ti</Badge>
                      ) : null}
                      {user.invitePending ? (
                        <Badge variant="outline">Povabilo poslano</Badge>
                      ) : null}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {appRoleLabels[user.role]}
                      {" \u00b7 "}
                      {user.lastSignInAt
                        ? `zadnja prijava ${formatDateTime(user.lastSignInAt)}`
                        : "še brez prijave"}
                    </p>
                  </div>

                  <UserRowActions
                    id={user.id}
                    email={user.email}
                    role={user.role}
                    invitePending={user.invitePending}
                    confirmed={user.confirmed}
                    isSelf={user.id === current?.id}
                  />
                </li>
              ))}
            </ul>
          </div>
        ) : null}
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
            text: "Vloga je zapisana v Supabase Auth in potuje v žetonu. Vsaka omejena stran jo preveri strežniško, ne le s skritim menijem.",
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
