import { BellRing, MailOpen, MessageSquareText } from "lucide-react";

import { PageHeader } from "@/components/page-header";

export default function NotificationsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Obveščanje"
        description="Pripravljena nadzorna plošča za bodoče pošiljanje obvestil članom."
      />

      <section className="grid gap-6 lg:grid-cols-3">
        {[
          {
            icon: MailOpen,
            title: "E-poštna obvestila",
            text: "Modul za pošiljanje bomo priklopili drugače, zato je tukaj za zdaj pripravljeno mesto za novo integracijo.",
          },
          {
            icon: MessageSquareText,
            title: "Operativna sporočila",
            text: "Za interno obveščanje ekipe lahko kasneje dodava osnutke, odobritve ali povezavo na drug servis.",
          },
          {
            icon: BellRing,
            title: "Sprožilci",
            text: "Prijave, spremembe statusa in dogodki ostajajo dobra osnova za avtomatiko, ko bova izbrala nov pristop.",
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
