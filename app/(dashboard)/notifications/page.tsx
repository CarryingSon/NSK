import Link from "next/link";
import { BellRing, History, MailOpen, MessageSquareText } from "lucide-react";

import { NotificationForm } from "@/components/forms/notification-form";
import { PageHeader } from "@/components/page-header";
import { buttonVariants } from "@/components/ui/button";
import { getNotificationAudiences } from "@/lib/data";
import { isEmailConfigured } from "@/lib/supabase/env";
import { cn } from "@/lib/utils";

export default async function NotificationsPage() {
  const [audiences, emailConfigured] = await Promise.all([
    getNotificationAudiences(),
    Promise.resolve(isEmailConfigured()),
  ]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Obveščanje"
        description="Pošiljanje obvestil članom z zapisovanjem vsake dostave v zgodovino, podobno kot v Kurniku."
        action={
          <Link
            href="/notifications/history"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "h-12 rounded-full px-6 text-base font-semibold",
            )}
          >
            <History className="size-4" />
            Odpri zgodovino
          </Link>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_360px]">
        <div className="surface-card rounded-[18px] border border-border p-6">
          <NotificationForm audiences={audiences} emailConfigured={emailConfigured} />
        </div>

        <aside className="space-y-6">
          {[
            {
              icon: MailOpen,
              title: "Email kampanje",
              text: "Vsako poslano obvestilo se zapiše v `email_logs`, nato pa se v zgodovini združi po zadevi in času pošiljanja.",
            },
            {
              icon: MessageSquareText,
              title: "HTML sporočila",
              text: "Email je oblikovan v istem duhu kot v Kurniku, le z NŠK brandingom in generično vsebino za člane.",
            },
            {
              icon: BellRing,
              title: "Povezava",
              text: emailConfigured
                ? "SMTP povezava je zaznana. Če želiš, lahko v naslednjem koraku dodava še testni email in dodatne predloge."
                : "SMTP povezava še ni nastavljena. Potrebne spremenljivke so prikazane tudi v nastavitvah aplikacije.",
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
        </aside>
      </div>
    </div>
  );
}
