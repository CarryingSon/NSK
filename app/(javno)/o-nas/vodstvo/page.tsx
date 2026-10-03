import type { Metadata } from "next";
import { Mail } from "lucide-react";

import { NaslovStrani } from "@/components/javna/naslov-strani";
import { nadzorniOdbor, upravniOdbor } from "@/lib/klub";

export const metadata: Metadata = {
  title: "Vodstvo",
  description:
    "Upravni in nadzorni odbor Notranjskega študentskega kluba.",
};

export default function VodstvoStran() {
  return (
    <>
      <NaslovStrani
        naslov="Vodstvo"
        opis="Klub vodita upravni in nadzorni odbor, izvoljena na občnem zboru."
      />

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="display-md">Upravni odbor</h2>
        <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {upravniOdbor.map((clan) => (
            <li key={clan.ime} className="rounded-2xl border border-border bg-card p-6">
              <p className="text-sm font-medium text-primary">{clan.funkcija}</p>
              <p className="font-heading mt-1 text-lg font-semibold">{clan.ime}</p>
              {"email" in clan && clan.email ? (
                <a
                  href={`mailto:${clan.email}`}
                  className="mt-3 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                >
                  <Mail className="size-4" aria-hidden="true" />
                  {clan.email}
                </a>
              ) : null}
            </li>
          ))}
        </ul>

        <h2 className="display-md mt-16">Nadzorni odbor</h2>
        <ul className="mt-8 grid gap-5 sm:grid-cols-3">
          {nadzorniOdbor.map((clan) => (
            <li key={clan.ime} className="rounded-2xl border border-border bg-card p-6">
              <p className="font-heading text-lg font-semibold">{clan.ime}</p>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
