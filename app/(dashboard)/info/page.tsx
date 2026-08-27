import {
  Building2,
  Clock,
  ExternalLink,
  Handshake,
  Landmark,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  UserRound,
  Users,
} from "lucide-react";

import { PageHeader } from "@/components/page-header";
import {
  club,
  clubBoard,
  clubMembership,
  clubPartners,
  clubSupervisoryBoard,
} from "@/lib/constants";

function Card({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Building2;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="surface-card rounded-[18px] border border-border p-6">
      <div className="flex items-center gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary">
          <Icon className="size-5" />
        </div>
        <h2 className="font-heading text-xl font-semibold text-foreground">
          {title}
        </h2>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

// Vrstica podatka: oznaka levo, vrednost desno. Številke poravnamo tabelarno,
// da se davčna, matična in TRR berejo kot stolpec.
function Row({
  icon: Icon,
  label,
  children,
  numeric,
}: {
  icon?: typeof Building2;
  label: string;
  children: React.ReactNode;
  numeric?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-t border-border py-2.5 first:border-t-0 first:pt-0">
      <span className="flex items-center gap-2 text-sm text-muted-foreground">
        {Icon ? <Icon className="size-4 shrink-0" /> : null}
        {label}
      </span>
      <span
        className={
          numeric
            ? "text-right text-sm font-medium tabular-nums text-foreground"
            : "text-right text-sm font-medium text-foreground"
        }
      >
        {children}
      </span>
    </div>
  );
}

export default function InfoPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Info"
        description="Uradni podatki Notranjskega študentskega kluba, sestava organov in pogoji včlanitve."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card icon={Building2} title="Klub">
          <div className="space-y-0">
            <Row label="Polno ime">{club.name}</Row>
            <Row icon={MapPin} label="Naslov">
              {club.street}
              <br />
              {club.city}
            </Row>
            <Row icon={Clock} label="Uradne ure">
              {club.officeHours}
            </Row>
            <Row icon={ExternalLink} label="Spletna stran">
              <a
                href={club.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {club.website.replace("https://www.", "")}
              </a>
            </Row>
          </div>
        </Card>

        <Card icon={Mail} title="Kontakt">
          <div className="space-y-0">
            <Row icon={Mail} label="E-pošta">
              <a
                href={`mailto:${club.email}`}
                className="text-primary hover:underline"
              >
                {club.email}
              </a>
            </Row>
            <Row icon={Phone} label={`Telefon (${club.phoneOwner})`} numeric>
              <a href={club.phoneHref} className="text-primary hover:underline">
                {club.phone}
              </a>
            </Row>
            {club.social.map((network) => (
              <Row key={network.label} label={network.label}>
                <a
                  href={network.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Odpri profil
                </a>
              </Row>
            ))}
          </div>
        </Card>

        <Card icon={Landmark} title="Uradni podatki">
          <div className="space-y-0">
            <Row label="Davčna številka" numeric>
              {club.taxNumber}
            </Row>
            <Row label="Matična številka" numeric>
              {club.registrationNumber}
            </Row>
            <Row label="TRR" numeric>
              {club.iban}
            </Row>
          </div>
          <p className="mt-4 text-xs leading-5 text-muted-foreground">
            ID za DDV na klubski spletni strani ni objavljen.
          </p>
        </Card>

        <Card icon={UserRound} title="Članstvo">
          <p className="text-sm leading-6 text-muted-foreground">
            {clubMembership.eligibility}
          </p>

          <h3 className="mt-5 text-sm font-semibold text-foreground">
            Kaj potrebuje novi član
          </h3>
          <ul className="mt-2 space-y-1.5">
            {clubMembership.requirements.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2 text-sm leading-6 text-muted-foreground"
              >
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                {item}
              </li>
            ))}
          </ul>

          <h3 className="mt-5 text-sm font-semibold text-foreground">
            Kje se včlani
          </h3>
          <ul className="mt-2 space-y-1.5">
            {clubMembership.channels.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2 text-sm leading-6 text-muted-foreground"
              >
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                {item}
              </li>
            ))}
          </ul>
        </Card>

        <Card icon={Users} title="Upravni odbor">
          <ul className="space-y-3">
            {clubBoard.map((member) => (
              <li
                key={member.name}
                className="flex items-start justify-between gap-4 border-t border-border pt-3 first:border-t-0 first:pt-0"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {member.name}
                  </p>
                  {member.email ? (
                    <a
                      href={`mailto:${member.email}`}
                      className="text-xs text-primary hover:underline"
                    >
                      {member.email}
                    </a>
                  ) : null}
                </div>
                <span className="shrink-0 text-right text-sm text-muted-foreground">
                  {member.role}
                </span>
              </li>
            ))}
          </ul>
        </Card>

        <Card icon={ShieldCheck} title="Nadzorni odbor">
          <ul className="space-y-3">
            {clubSupervisoryBoard.map((member) => (
              <li
                key={member.name}
                className="border-t border-border pt-3 text-sm font-medium text-foreground first:border-t-0 first:pt-0"
              >
                {member.name}
              </li>
            ))}
          </ul>

          <h3 className="mt-6 flex items-center gap-2 text-sm font-semibold text-foreground">
            <Handshake className="size-4 text-primary" />
            Partnerji
          </h3>
          <ul className="mt-2 space-y-1.5">
            {clubPartners.map((partner) => (
              <li key={partner} className="text-sm leading-6 text-muted-foreground">
                {partner}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <p className="text-xs leading-5 text-muted-foreground">
        Podatki so povzeti s klubske spletne strani{" "}
        <a
          href={club.website}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          {club.website.replace("https://www.", "")}
        </a>{" "}
        in se urejajo v lib/constants.ts.
      </p>
    </div>
  );
}
