import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, Gift, MapPin } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DruzbeneObjave } from "@/components/javna/druzbene-objave";
import { klub, podrocja, ugodnosti } from "@/lib/klub";
import { izvlecek, pridobiNovice } from "@/lib/novice";

export default async function Naslovnica() {
  const novice = (await pridobiNovice(3)).slice(0, 3);

  return (
    <>
      <section className="mx-auto max-w-6xl px-4 pt-16 pb-20 sm:px-6 sm:pt-24">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr]">
          <div>
            <p className="text-sm font-semibold text-primary">
              Cerknica · Loška Dolina · Bloke
            </p>
            <h1 className="display-lg mt-4 text-balance">
              Študentska leta so krajša, kot misliš.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Notranjski študentski klub pripravlja dogodke, šport in
              izobraževanja za študente in dijake Notranjske - članom pa odpira
              vrata do ugodnosti pri domačih partnerjih.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                render={<Link href="/vclanitev" />}
                nativeButton={false}
                size="lg"
              >
                Včlani se
              </Button>
              <Button
                render={<Link href="/ugodnosti" />}
                nativeButton={false}
                size="lg"
                variant="outline"
              >
                Poglej ugodnosti
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="relative col-span-2 aspect-[16/9] overflow-hidden rounded-2xl">
              <Image
                src={podrocja[0].slika}
                alt="Dogodek Notranjskega študentskega kluba"
                fill
                sizes="(min-width: 1024px) 45vw, 100vw"
                className="object-cover"
                priority
              />
            </div>
            <div className="relative aspect-square overflow-hidden rounded-2xl">
              <Image
                src={podrocja[1].slika}
                alt="Športna aktivnost kluba"
                fill
                sizes="(min-width: 1024px) 22vw, 50vw"
                className="object-cover"
              />
            </div>
            <div className="relative aspect-square overflow-hidden rounded-2xl">
              <Image
                src={podrocja[2].slika}
                alt="Izobraževalna dejavnost kluba"
                fill
                sizes="(min-width: 1024px) 22vw, 50vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-secondary/50 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="display-md">Kaj klub počne</h2>
          <ul className="mt-8 grid gap-5 sm:grid-cols-3">
            {podrocja.map((podrocje) => (
              <li
                key={podrocje.naslov}
                className="rounded-2xl border border-border bg-card p-6"
              >
                <h3 className="font-heading text-lg font-semibold">
                  {podrocje.naslov}
                </h3>
                <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted-foreground">
                  {podrocje.opis}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="display-md">Aktualno</h2>
            <p className="mt-2 text-muted-foreground">
              Kaj se pri klubu dogaja zdaj.
            </p>
          </div>
          <Button
            render={<Link href="/aktualno" />}
            nativeButton={false}
            variant="outline"
            size="sm"
          >
            Vse novice
            <ArrowRight className="size-4" aria-hidden="true" />
          </Button>
        </div>

        {novice.length > 0 ? (
          <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
                  <div className="p-5">
                    <h3 className="font-heading leading-snug font-semibold text-balance">
                      {novica.naslov}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {izvlecek(novica.vsebina, 120)}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-8 rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground">
            Novic trenutno ni mogoče naložiti.
          </p>
        )}
      </section>

      <DruzbeneObjave />

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="grid gap-10 rounded-3xl border border-border bg-secondary/50 p-8 sm:p-12 lg:grid-cols-2">
          <div>
            <Gift className="size-7 text-primary" aria-hidden="true" />
            <h2 className="display-md mt-4">Kaj ti prinese članstvo</h2>
            <p className="mt-3 text-muted-foreground">
              Članarina je brezplačna, ugodnosti pa veljajo pri partnerjih po
              vsej Notranjski.
            </p>
            <Button
              render={<Link href="/ugodnosti" />}
              nativeButton={false}
              className="mt-6"
              variant="outline"
            >
              Vse ugodnosti
            </Button>
          </div>
          <ul className="space-y-3">
            {ugodnosti.slice(0, 5).map((ugodnost) => (
              <li
                key={ugodnost}
                className="flex gap-3 text-[0.9375rem] leading-relaxed"
              >
                <span
                  className="mt-2 size-1.5 shrink-0 rounded-full bg-primary"
                  aria-hidden="true"
                />
                {ugodnost}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        <div className="rounded-3xl bg-foreground px-8 py-14 text-background sm:px-12">
          <h2 className="display-md text-balance">Postani član NŠK</h2>
          <p className="mt-3 max-w-xl text-background/70">
            Si študent ali dijak s stalnim prebivališčem v občini Cerknica,
            Loška Dolina ali Bloke? Včlanitev vzame nekaj minut.
          </p>
          <dl className="mt-8 grid gap-6 sm:grid-cols-2">
            <div className="flex gap-3">
              <CalendarDays
                className="mt-0.5 size-5 shrink-0 text-background/60"
                aria-hidden="true"
              />
              <div>
                <dt className="text-sm font-semibold">Uradne ure</dt>
                <dd className="text-sm text-background/70">{klub.uradneUre}</dd>
              </div>
            </div>
            <div className="flex gap-3">
              <MapPin
                className="mt-0.5 size-5 shrink-0 text-background/60"
                aria-hidden="true"
              />
              <div>
                <dt className="text-sm font-semibold">Kje</dt>
                <dd className="text-sm text-background/70">
                  {klub.naslov.ulica}, {klub.naslov.posta}
                </dd>
              </div>
            </div>
          </dl>
          <div className="mt-9 flex flex-wrap gap-3">
            <Button
              render={<Link href="/vclanitev" />}
              nativeButton={false}
              size="lg"
              className="bg-background text-foreground hover:opacity-85"
            >
              Izpolni obrazec
            </Button>
            <Button
              render={<Link href="/pridruzi-se" />}
              nativeButton={false}
              size="lg"
              variant="ghost"
              className="text-background hover:bg-background/10 hover:text-background"
            >
              Kaj potrebujem?
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
