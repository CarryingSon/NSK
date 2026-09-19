import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { NaslovStrani } from "@/components/javna/naslov-strani";
import { sklopiUgodnosti, ugodnosti } from "@/lib/klub";

export const metadata: Metadata = {
  title: "Ugodnosti za člane",
  description:
    "Popusti, brezplačne aktivnosti in prednostni dostop do dogodkov, ki pripadajo članom Notranjskega študentskega kluba.",
};

export default function UgodnostiStran() {
  return (
    <>
      <NaslovStrani
        naslov="Ugodnosti za člane"
        opis="Popusti in privilegiji, ki pripadajo članom Notranjskega študentskega kluba pri partnerjih po vsej Notranjski."
      />

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <ul className="grid gap-5 sm:grid-cols-3">
          {sklopiUgodnosti.map((sklop) => (
            <li key={sklop.naslov} className="rounded-2xl border border-border bg-card p-6">
              <h2 className="font-heading text-lg font-semibold">{sklop.naslov}</h2>
              <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted-foreground">
                {sklop.opis}
              </p>
            </li>
          ))}
        </ul>

        <h2 className="display-md mt-16">Kaj konkretno dobiš</h2>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {ugodnosti.map((ugodnost) => (
            <li
              key={ugodnost}
              className="flex gap-3 rounded-2xl border border-border bg-card p-5"
            >
              <Check className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
              <span className="text-[0.9375rem] leading-relaxed">{ugodnost}</span>
            </li>
          ))}
        </ul>

        <figure className="mt-16">
          <div className="overflow-hidden rounded-3xl border border-border bg-white">
            <Image
              src="/stran/ugodnosti.png"
              alt="Pregled ugodnosti NŠK člana: brezplačne športne aktivnosti, popusti pri partnerjih, cenejše vstopnice in brezplačna članarina v knjižnici."
              width={1080}
              height={1080}
              sizes="(min-width: 1024px) 900px, 100vw"
              className="h-auto w-full"
            />
          </div>
          <figcaption className="mt-3 text-sm text-muted-foreground">
            Ugodnosti NŠK člana na enem mestu.
          </figcaption>
        </figure>

        <div className="mt-16 rounded-3xl border border-border bg-white/[0.04] p-8 text-center sm:p-12">
          <h2 className="display-md">Ugodnosti veljajo za člane</h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Članarina je brezplačna. Potrebuješ le potrdilo o vpisu in stalno
            prebivališče v občini Cerknica, Loška Dolina ali Bloke.
          </p>
          <Button
            render={<Link href="/vclanitev" />}
            nativeButton={false}
            size="lg"
            className="mt-7"
          >
            Včlani se
          </Button>
        </div>
      </section>
    </>
  );
}
