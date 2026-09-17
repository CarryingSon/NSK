import type { Metadata } from "next";

import { Glava } from "@/components/javna/glava";
import { Noga } from "@/components/javna/noga";
import { klub } from "@/lib/klub";

export const metadata: Metadata = {
  title: {
    default: `${klub.ime} - NŠK`,
    template: `%s - ${klub.kratica}`,
  },
  description:
    "Notranjski študentski klub povezuje študente in dijake občin Cerknica, Loška Dolina in Bloke. Dogodki, ugodnosti za člane in vse o včlanitvi.",
};

export default function JavnaPostavitev({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-svh flex-col">
      {/* Preskok na vsebino je prva stvar, ki jo tipkovnica sreča; stara stran
          tega ni imela in je to v izjavi o dostopnosti tudi priznavala. */}
      <a
        href="#vsebina"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[60] focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:text-primary-foreground"
      >
        Preskoči na vsebino
      </a>
      <Glava />
      <main id="vsebina" className="flex-1">
        {children}
      </main>
      <Noga />
    </div>
  );
}
