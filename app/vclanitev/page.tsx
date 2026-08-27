import type { Metadata } from "next";
import Image from "next/image";

import { ApplicationForm } from "@/components/applications/application-form";
import { club } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Včlani se v ${club.shortName}`,
  description:
    "Prijavnica za članstvo v Notranjskem študentskem klubu za študente in dijake.",
  // Obrazec je vgrajen v klubsko spletno stran; v iskalniku nima kaj iskati.
  robots: { index: false, follow: false },
};

/**
 * Javni obrazec za včlanitev.
 *
 * Stoji zunaj skupine (dashboard), zato nima stranske vrstice in ne zahteva
 * prijave - zaščita poti ga izpušča. Postavitev je ozka in brez lastnega ozadja,
 * da se v iframeu na klubski strani ne bije z njihovo.
 */
export default function ApplicationPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-10 sm:px-8">
      <header className="mb-8 text-center">
        <Image
          src="/nsk-logo.svg"
          alt={club.name}
          width={352}
          height={66}
          priority
          className="mx-auto h-8 w-auto dark:brightness-0 dark:invert"
        />
        <h1 className="mt-6 font-heading text-3xl font-semibold tracking-[-0.025em] text-foreground sm:text-4xl">
          Včlani se v {club.shortName}
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-[1.0625rem] leading-relaxed text-muted-foreground">
          Izpolni prijavnico in postani član. Za včlanitev potrebuješ potrdilo o
          vpisu za tekoče študijsko oziroma šolsko leto.
        </p>
      </header>

      <ApplicationForm />

      <footer className="mt-10 text-center text-sm text-muted-foreground">
        {club.name} &middot; {club.street}, {club.city}
        <br />
        Uradne ure: {club.officeHours}
      </footer>
    </main>
  );
}
