import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { NaslovStrani } from "@/components/javna/naslov-strani";
import { izvlecek, pridobiNovice } from "@/lib/novice";

export const metadata: Metadata = {
  title: "Aktualno",
  description: "Novice, razpisi in obvestila Notranjskega študentskega kluba.",
};

export default async function AktualnoStran() {
  const novice = await pridobiNovice();

  return (
    <>
      <NaslovStrani
        naslov="Aktualno"
        opis="Novice, razpisi in obvestila kluba."
      />

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        {novice.length > 0 ? (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {novice.map((novica) => (
              <li key={novica.id}>
                <Link
                  href={`/aktualno/${novica.id}`}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-colors hover:border-primary/40"
                >
                  {novica.slika ? (
                    <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                      <Image
                        src={novica.slika}
                        alt=""
                        fill
                        sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      />
                    </div>
                  ) : null}
                  <div className="flex flex-1 flex-col p-5">
                    <h2 className="font-heading leading-snug font-semibold text-balance">
                      {novica.naslov}
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {izvlecek(novica.vsebina, 140)}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">
            Novic trenutno ni mogoče naložiti. Poskusi znova čez nekaj trenutkov.
          </p>
        )}
      </section>
    </>
  );
}
