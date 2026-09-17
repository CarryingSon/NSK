"use client";

import { useCallback, useState, useSyncExternalStore } from "react";

import { Button } from "@/components/ui/button";
import { FacebookIkona } from "@/components/javna/ikone";
import { klub } from "@/lib/klub";

const KLJUC = "nsk-facebook-privolitev";

/**
 * Facebookova časovnica kluba, vgrajena z zaslonom za privolitev.
 *
 * Vtičnik ob nalaganju postavi Metine piškotke, kar je po GDPR privolitvena
 * obdelava. Namesto pasice čez celo stran zato uporabimo prijem dveh klikov:
 * dokler obiskovalec ne pritisne gumba, se ne naloži nič Metinega in stran
 * ostane brez tujih piškotkov.
 *
 * Izbira se shrani v localStorage, da je ni treba potrjevati ob vsakem obisku.
 * Ta je lahko nedosegljiv (zasebno okno, blokirani piškotki), zato je vsak
 * dostop do njega ovit - razdelek mora delovati tudi, kadar odpove.
 */
/** Naročnina na spremembe shrambe; ujame tudi privolitev v drugem zavihku. */
function naroci(obvesti: () => void) {
  window.addEventListener("storage", obvesti);
  return () => window.removeEventListener("storage", obvesti);
}

function preberi() {
  try {
    return localStorage.getItem(KLJUC) === "da";
  } catch {
    return false;
  }
}

// Na strežniku shrambe ni; privzeto je torej "ni privolitve", kar se ujema s
// tem, kar vidi obiskovalec pred prvim klikom - brez neskladja ob hidraciji.
function naStrezniku() {
  return false;
}

export function FacebookStran() {
  const shranjena = useSyncExternalStore(naroci, preberi, naStrezniku);
  const [potrjeno, setPotrjeno] = useState(false);
  const prikazi = potrjeno || shranjena;

  const potrdi = useCallback(() => {
    setPotrjeno(true);
    try {
      localStorage.setItem(KLJUC, "da");
    } catch {
      // Neshranjena privolitev je še vedno veljavna za ta obisk.
    }
  }, []);

  const naslovVticnika = new URL("https://www.facebook.com/plugins/page.php");
  naslovVticnika.searchParams.set("href", klub.druzbena.facebook);
  naslovVticnika.searchParams.set("tabs", "timeline");
  naslovVticnika.searchParams.set("width", "500");
  naslovVticnika.searchParams.set("height", "640");
  naslovVticnika.searchParams.set("adapt_container_width", "true");
  naslovVticnika.searchParams.set("small_header", "true");
  naslovVticnika.searchParams.set("hide_cover", "false");
  naslovVticnika.searchParams.set("show_facepile", "false");
  naslovVticnika.searchParams.set("locale", "sl_SI");

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex items-center gap-2.5 border-b border-border px-5 py-4">
        <FacebookIkona className="size-4 text-primary" />
        <h3 className="font-heading text-[0.9375rem] font-semibold">
          Facebook časovnica
        </h3>
      </div>

      {prikazi ? (
        // Vtičnik je širok največ 500 px, kartica pa je lahko širša. Bela
        // podlaga pod njim in sredinska poravnava poskrbita, da je videti kot
        // en sam bel list in ne kot ozek otok sredi temne kartice.
        <div className="flex flex-1 justify-center bg-white">
          <iframe
            src={naslovVticnika.toString()}
            title="Objave Notranjskega študentskega kluba na Facebooku"
            className="h-[640px] w-full max-w-[500px] border-0"
            scrolling="no"
            allow="encrypted-media"
          />
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
          <p className="max-w-sm text-[0.9375rem] leading-relaxed text-muted-foreground">
            Za prikaz časovnice se naloži vsebina Facebooka, ki postavi njihove
            piškotke. Dokler tega ne potrdiš, stran ne naloži ničesar Metinega.
          </p>
          <Button onClick={potrdi}>Prikaži objave</Button>
          <a
            href={klub.druzbena.facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
          >
            Ali pa odpri na Facebooku
          </a>
        </div>
      )}
    </div>
  );
}
