import type { Metadata } from "next";
import { Clock, Mail, MapPin, Phone } from "lucide-react";

import { NaslovStrani } from "@/components/javna/naslov-strani";
import { klub, upravniOdbor } from "@/lib/klub";

export const metadata: Metadata = {
  title: "Kontakt",
  description: `${klub.ime}, ${klub.naslov.ulica}, ${klub.naslov.posta}. Uradne ure: ${klub.uradneUre}.`,
};

const predsednica = upravniOdbor[0];

export default function KontaktStran() {
  return (
    <>
      <NaslovStrani
        naslov="Kontakt"
        opis="Piši nam, pokliči ali se oglasi v času uradnih ur."
      />

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-7">
            <h2 className="font-heading text-lg font-semibold">Splošne informacije</h2>
            <address className="mt-5 space-y-4 text-[0.9375rem] not-italic">
              <p className="flex items-start gap-3">
                <MapPin className="mt-0.5 size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
                <span>
                  {klub.ime}
                  <br />
                  {klub.naslov.ulica}
                  <br />
                  {klub.naslov.posta}
                </span>
              </p>
              <p className="flex items-center gap-3">
                <Mail className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
                <a href={`mailto:${klub.email}`} className="hover:text-primary">
                  {klub.email}
                </a>
              </p>
              <p className="flex items-center gap-3">
                <Phone className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
                <a href={`tel:${klub.telefonUrl}`} className="hover:text-primary">
                  {klub.telefon}
                </a>
              </p>
              <p className="flex items-center gap-3">
                <Clock className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
                <span>Uradne ure: {klub.uradneUre}</span>
              </p>
            </address>
          </div>

          <div className="rounded-2xl border border-border bg-card p-7">
            <h2 className="font-heading text-lg font-semibold">
              Predsednica upravnega odbora
            </h2>
            <p className="mt-5 text-[0.9375rem]">{predsednica.ime}</p>
            <div className="mt-4 space-y-3 text-[0.9375rem]">
              <p className="flex items-center gap-3">
                <Mail className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
                <a href={`mailto:${predsednica.email}`} className="hover:text-primary">
                  {predsednica.email}
                </a>
              </p>
              <p className="flex items-center gap-3">
                <Phone className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
                <a href={`tel:${klub.telefonUrl}`} className="hover:text-primary">
                  {klub.telefon}
                </a>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-border bg-card p-7">
          <h2 className="font-heading text-lg font-semibold">Podatki o klubu</h2>
          <dl className="mt-5 grid gap-5 text-[0.9375rem] sm:grid-cols-3">
            <div>
              <dt className="text-muted-foreground">Davčna številka</dt>
              <dd className="mt-1 font-medium">{klub.davcna}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Matična številka</dt>
              <dd className="mt-1 font-medium">{klub.maticna}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">TRR</dt>
              <dd className="mt-1 font-medium">{klub.trr}</dd>
            </div>
          </dl>
        </div>
      </section>
    </>
  );
}
