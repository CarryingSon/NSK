import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";

import { FacebookIkona, InstagramIkona } from "@/components/javna/ikone";

import { navigacija } from "@/components/javna/navigacija";
import { klub, partnerji } from "@/lib/klub";

export function Noga() {
  const leto = new Date().getFullYear();

  return (
    <footer className="mt-24 border-t border-border bg-secondary/60">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <Image
              src="/nsk-logo.svg"
              alt="Notranjski študentski klub"
              width={352}
              height={66}
              className="h-8 w-auto"
            />
            <address className="mt-5 space-y-2.5 text-sm text-muted-foreground not-italic">
              <p className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                <span>
                  {klub.naslov.ulica}
                  <br />
                  {klub.naslov.posta}
                </span>
              </p>
              <p className="flex items-center gap-2.5">
                <Mail className="size-4 shrink-0" aria-hidden="true" />
                <a href={`mailto:${klub.email}`} className="hover:text-foreground">
                  {klub.email}
                </a>
              </p>
              <p className="flex items-center gap-2.5">
                <Phone className="size-4 shrink-0" aria-hidden="true" />
                <a href={`tel:${klub.telefonUrl}`} className="hover:text-foreground">
                  {klub.telefon}
                </a>
              </p>
            </address>
            <p className="mt-5 text-sm text-muted-foreground">
              Uradne ure: {klub.uradneUre}
            </p>
            <div className="mt-5 flex gap-2">
              <a
                href={klub.druzbena.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="rounded-full border border-border bg-background p-2.5 transition-colors hover:bg-muted"
              >
                <InstagramIkona className="size-4" />
              </a>
              <a
                href={klub.druzbena.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="rounded-full border border-border bg-background p-2.5 transition-colors hover:bg-muted"
              >
                <FacebookIkona className="size-4" />
              </a>
            </div>
          </div>

          <nav aria-label="Noga">
            <h2 className="text-sm font-semibold">Stran</h2>
            <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
              {navigacija
                .flatMap((povezava) => povezava.podstrani ?? [povezava])
                .map((povezava) => (
                  <li key={povezava.pot}>
                    <Link href={povezava.pot} className="hover:text-foreground">
                      {povezava.naslov}
                    </Link>
                  </li>
                ))}
            </ul>
          </nav>

          <div>
            <h2 className="text-sm font-semibold">Naši partnerji</h2>
            <ul className="mt-4 flex flex-wrap items-center gap-4">
              {partnerji.map((partner) => (
                <li key={partner.ime}>
                  <a
                    href={partner.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-lg bg-white px-3 py-2 opacity-80 transition-opacity hover:opacity-100"
                  >
                    {/* Logotipi partnerjev so temni na prozornem ozadju in bi v
                        temni shemi izginili, zato dobijo svojo belo podlago. */}
                    <Image
                      src={partner.logo}
                      alt={partner.ime}
                      width={110}
                      height={44}
                      className="h-9 w-auto object-contain"
                    />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-border pt-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {leto} {klub.ime}. Vse pravice pridržane.
          </p>
          <p className="flex gap-4">
            <Link href="/o-nas/skladnost" className="hover:text-foreground">
              Izjava o dostopnosti
            </Link>
            <a
              href="/dokumenti/politika-zasebnosti.pdf"
              className="hover:text-foreground"
            >
              Zasebnost
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
