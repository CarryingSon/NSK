import { statSync } from "node:fs";
import path from "node:path";

import type { Metadata } from "next";
import { Download, FileText, Files, Landmark, ScrollText } from "lucide-react";

import { NaslovStrani } from "@/components/javna/naslov-strani";
import { dokumenti } from "@/lib/klub";

export const metadata: Metadata = {
  title: "Dokumenti in pravilniki",
  description:
    "Statut, pravilniki in drugi javni dokumenti Notranjskega študentskega kluba.",
};

const ikoneSkupin: Record<string, typeof FileText> = {
  "Temeljni akt": Landmark,
  Pravilniki: ScrollText,
  Dokumenti: Files,
};

// Stran je statična, zato se velikost prebere enkrat ob gradnji.
function velikost(datoteka: string) {
  try {
    const bajti = statSync(path.join(process.cwd(), "public", "dokumenti", datoteka)).size;
    return bajti >= 1024 * 1024
      ? `${(bajti / (1024 * 1024)).toFixed(1).replace(".", ",")} MB`
      : `${Math.max(1, Math.round(bajti / 1024))} KB`;
  } catch {
    return null;
  }
}

/**
 * Dokumenti kot mreža kartic, kot na stari strani: vsaka kartica je cela
 * povezava, z ikono, vrsto datoteke in znakom za prenos - da je jasno, da se
 * dokument odpre oziroma prenese.
 */
export default function DokumentiStran() {
  return (
    <>
      <NaslovStrani
        naslov="Dokumenti in pravilniki"
        opis="Vsi pomembni dokumenti, statuti in pravilniki Notranjskega študentskega kluba."
      />

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        {dokumenti.map((skupina) => {
          const Ikona = ikoneSkupin[skupina.skupina] ?? FileText;

          return (
            <div key={skupina.skupina} className="mb-14 last:mb-0">
              <div className="flex items-center gap-3 border-b-2 border-primary pb-3">
                <Ikona className="size-7 text-primary" aria-hidden="true" />
                <h2 className="display-md">{skupina.skupina}</h2>
              </div>

              <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {skupina.vsebina.map((dokument) => {
                  const vrsta = dokument.datoteka.split(".").pop()?.toUpperCase();
                  const obseg = velikost(dokument.datoteka);

                  return (
                    <li key={dokument.datoteka}>
                      <a
                        href={`/dokumenti/${dokument.datoteka}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        // Word se ne odpre v brskalniku - naj se prenese.
                        download={vrsta === "PDF" ? undefined : true}
                        className="group flex h-full items-center gap-4 rounded-xl border-2 border-border bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary hover:shadow-[0_8px_20px_rgba(243,103,23,0.15)]"
                      >
                        <span className="flex size-12 shrink-0 items-center justify-center rounded-[10px] bg-gradient-to-br from-[#f36717] to-[#d95d13] text-white">
                          <FileText className="size-6" aria-hidden="true" />
                        </span>
                        <span className="flex min-w-0 flex-1 flex-col self-stretch justify-between gap-3">
                          <span className="text-[0.9375rem] leading-snug font-semibold">
                            {dokument.naslov}
                          </span>
                          <span className="flex items-center justify-between gap-2">
                            <span className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span className="rounded bg-muted-foreground/80 px-2 py-0.5 font-semibold text-background">
                                {vrsta}
                              </span>
                              {obseg}
                            </span>
                            <span className="flex items-center gap-1 text-sm font-medium text-primary">
                              {vrsta === "PDF" ? "Odpri" : "Prenesi"}
                              <Download
                                className="size-4 transition-transform duration-300 group-hover:translate-y-0.5"
                                aria-hidden="true"
                              />
                            </span>
                          </span>
                        </span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}

        <p className="mt-10 text-sm text-muted-foreground">
          Dokumenti se odprejo v novem zavihku. Če katerega ne moreš odpreti ali
          prebrati, nam piši - pošljemo ti ga v dostopni obliki.
        </p>
      </section>
    </>
  );
}
