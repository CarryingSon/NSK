"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

import {
  NAJOZJI_VTICNIK,
  NAJSIRSI_VTICNIK,
  facebookVticnik,
  instagramVticnik,
  visinaVgradnje,
} from "@/lib/druzbena";

/**
 * Kartica z vgrajeno časovnico družbenega omrežja.
 *
 * Instagram in Facebook se izrisujeta enako, kot ju je izrisovala stara stran:
 * z uradnim vtičnikom omrežja v okvirju. Metin Graph API bi dal izris po meri,
 * a zahteva žeton, ki ga klub še nima - vtičnik pa dela takoj in objav ni
 * treba nikamor sinhronizirati, ker jih omrežje postreže samo.
 *
 * Kartica mora izmeriti samo sebe, ker se vtičnika okvirju ne prilagodita
 * sama: Facebooku je treba širino povedati v naslovu, Instagramova višina pa
 * je odvisna od širine, tuje vsebine v okvirju pa ni mogoče izmeriti. Zato
 * "use client" in ResizeObserver - stara stran je isto reč reševala z
 * merjenjem okna ob vsaki spremembi velikosti.
 *
 * Oba vtičnika se izrisujeta na belem. Bela podlaga pod okvirjem in sredinska
 * poravnava poskrbita, da je videti kot en bel list in ne kot ozek otok sredi
 * temne kartice.
 *
 * Pozor: ob nalaganju vtičnik postavi piškotke omrežja. Tako je delala tudi
 * stara stran; če bo klub hotel privolitveni zaslon pred njim, ga je treba
 * vriniti tu, na enem mestu za obe omrežji.
 */
type Props = {
  omrezje: "instagram" | "facebook";
  ikona: ReactNode;
  naslov: string;
  /** Opis okvirja za bralnike zaslona. */
  opis: string;
};

/**
 * Meritev se zaokroži navzdol na mrežo te gostote.
 *
 * Sprememba širine pomeni nov naslov vtičnika in s tem ponovno nalaganje
 * okvirja. Brez zaokroževanja bi se ob vsakem pikslu vlečenja okna vtičnik
 * naložil znova; s korakom 20 px se to zgodi le nekajkrat, razlika v izrisu
 * pa je nevidna, ker vtičnik notri sam zapolni odmerjeno širino.
 */
const KORAK = 20;

function izmerjenaSirina(sirina: number) {
  const omejena = Math.min(NAJSIRSI_VTICNIK, Math.max(NAJOZJI_VTICNIK, sirina));
  return Math.floor(omejena / KORAK) * KORAK;
}

export function DruzbenaVgradnja({ omrezje, ikona, naslov, opis }: Props) {
  const podlaga = useRef<HTMLDivElement>(null);
  const [sirina, setSirina] = useState<number | null>(null);

  useEffect(() => {
    const element = podlaga.current;
    if (!element) {
      return;
    }

    const opazovalec = new ResizeObserver(([vnos]) => {
      setSirina(izmerjenaSirina(vnos.contentRect.width));
    });
    opazovalec.observe(element);
    return () => opazovalec.disconnect();
  }, []);

  // Dokler širina ni znana, okvirja ne postavimo: z napačno širino bi se
  // vtičnik naložil dvakrat, prvič odrezan. Višina je medtem odmerjena po
  // najširšem vtičniku, da se stran pod kartico ne premakne, ko se vsebina
  // pojavi.
  const visina = visinaVgradnje(sirina ?? NAJSIRSI_VTICNIK);

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex items-center gap-2.5 border-b border-border px-5 py-4">
        {ikona}
        <h3 className="font-heading text-[0.9375rem] font-semibold">{naslov}</h3>
      </div>

      <div
        ref={podlaga}
        className="flex flex-1 justify-center bg-white"
        style={{ minHeight: `${visina}px` }}
      >
        {sirina === null ? null : (
          <iframe
            src={
              omrezje === "facebook"
                ? facebookVticnik(sirina, visina)
                : instagramVticnik()
            }
            title={opis}
            width={sirina}
            height={visina}
            style={{ width: `${sirina}px`, height: `${visina}px` }}
            className="border-0"
            loading="lazy"
            scrolling="no"
            // "web-share" s starega seznama je izpuščen: Chrome ga v tem seznamu ne
            // pozna in ga zavrne z opozorilom v konzoli, vtičnik pa ga ne rabi.
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"
          />
        )}
      </div>
    </div>
  );
}
