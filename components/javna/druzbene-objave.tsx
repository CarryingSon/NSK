import Image from "next/image";
import { FacebookIkona, InstagramIkona } from "@/components/javna/ikone";

import { klub } from "@/lib/klub";
import { pridobiDruzbeneObjave } from "@/lib/druzbena";

export async function DruzbeneObjave() {
  const objave = await pridobiDruzbeneObjave();

  return (
    <section className="border-y border-border bg-secondary/50 py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="display-md">Sledi nam</h2>
            <p className="mt-2 text-muted-foreground">
              Najhitreje izveš na Instagramu in Facebooku.
            </p>
          </div>
          <div className="flex gap-2">
            <a
              href={klub.druzbena.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
            >
              <InstagramIkona className="size-4" />
              Instagram
            </a>
            <a
              href={klub.druzbena.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
            >
              <FacebookIkona className="size-4" />
              Facebook
            </a>
          </div>
        </div>

        {objave.length > 0 ? (
          <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {objave.map((objava) => (
              <li key={objava.id}>
                <a
                  href={objava.povezava}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block overflow-hidden rounded-2xl border border-border bg-card transition-colors hover:border-primary/40"
                >
                  {objava.slika ? (
                    <div className="relative aspect-square overflow-hidden bg-muted">
                      <Image
                        src={objava.slika}
                        alt=""
                        fill
                        sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 100vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      />
                    </div>
                  ) : null}
                  <div className="p-4">
                    <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      {objava.omrezje === "instagram" ? (
                        <InstagramIkona className="size-3.5" />
                      ) : (
                        <FacebookIkona className="size-3.5" />
                      )}
                      {new Date(objava.objavljeno).toLocaleDateString("sl-SI")}
                    </p>
                    <p className="mt-2 line-clamp-3 text-sm leading-relaxed">
                      {objava.besedilo}
                    </p>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-8 rounded-2xl border border-dashed border-border bg-background p-8 text-center text-muted-foreground">
            Objave z družbenih omrežij se bodo prikazale tu, ko bo povezava z
            Meto vzpostavljena.
          </p>
        )}
      </div>
    </section>
  );
}
