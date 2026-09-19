import type { Metadata } from "next";
import { FileText } from "lucide-react";

import { NaslovStrani } from "@/components/javna/naslov-strani";
import { dokumenti } from "@/lib/klub";

export const metadata: Metadata = {
  title: "Dokumenti in pravilniki",
  description:
    "Statut, pravilniki in drugi javni dokumenti Notranjskega študentskega kluba.",
};

export default function DokumentiStran() {
  return (
    <>
      <NaslovStrani
        naslov="Dokumenti in pravilniki"
        opis="Vsi pomembni dokumenti, statuti in pravilniki Notranjskega študentskega kluba."
      />

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        {dokumenti.map((skupina) => (
          <div key={skupina.skupina} className="mb-12 last:mb-0">
            <h2 className="display-md">{skupina.skupina}</h2>
            <ul className="mt-6 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
              {skupina.vsebina.map((dokument) => (
                <li key={dokument.datoteka}>
                  <a
                    href={`/dokumenti/${dokument.datoteka}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-5 transition-colors hover:bg-muted"
                  >
                    <FileText className="size-5 shrink-0 text-primary" aria-hidden="true" />
                    <span className="flex-1 text-[0.9375rem] leading-snug">
                      {dokument.naslov}
                    </span>
                    <span className="badge shrink-0">PDF</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <p className="mt-10 text-sm text-muted-foreground">
          Dokumenti se odprejo v novem zavihku. Če katerega ne moreš odpreti ali
          prebrati, nam piši - pošljemo ti ga v dostopni obliki.
        </p>
      </section>
    </>
  );
}
