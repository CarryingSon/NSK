import Image from "next/image";

import { FacebookStran } from "@/components/javna/facebook-stran";
import { FacebookIkona, InstagramIkona } from "@/components/javna/ikone";
import { klub } from "@/lib/klub";
import { pridobiDruzbeneObjave } from "@/lib/druzbena";

export async function DruzbeneObjave() {
  const objave = await pridobiDruzbeneObjave();
  const instagramObjave = objave.filter((objava) => objava.omrezje === "instagram");

  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="display-md">Sledi nam</h2>
          <p className="mt-2 text-muted-foreground">
            Kaj se dogaja na Instagramu in Facebooku.
          </p>
        </div>
        <div className="flex gap-2">
          <a
            href={klub.druzbena.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
          >
            <InstagramIkona className="size-4" />
            Instagram
          </a>
          <a
            href={klub.druzbena.facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
          >
            <FacebookIkona className="size-4" />
            Facebook
          </a>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Instagram: objave pridejo, ko bo vzpostavljena povezava z Metinim
            API-jem. Do takrat razdelek ne zeva prazen, ampak povabi na profil. */}
        <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card">
          <div className="flex items-center gap-2.5 border-b border-border px-5 py-4">
            <InstagramIkona className="size-4 text-primary" />
            <h3 className="font-heading text-[0.9375rem] font-semibold">
              Instagram
            </h3>
          </div>

          {instagramObjave.length > 0 ? (
            <ul className="grid flex-1 grid-cols-2 gap-px bg-border">
              {instagramObjave.slice(0, 4).map((objava) => (
                <li key={objava.id} className="bg-card">
                  <a
                    href={objava.povezava}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block"
                  >
                    {objava.slika ? (
                      <div className="relative aspect-square overflow-hidden bg-muted">
                        <Image
                          src={objava.slika}
                          alt=""
                          fill
                          sizes="(min-width: 1024px) 22vw, 45vw"
                          className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                        />
                      </div>
                    ) : null}
                    <p className="line-clamp-2 p-4 text-sm leading-relaxed">
                      {objava.besedilo}
                    </p>
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
              <p className="max-w-sm text-[0.9375rem] leading-relaxed text-muted-foreground">
                Objave z Instagrama se bodo prikazale tu, ko bo vzpostavljena
                povezava z Meto. Do takrat jih najdeš na profilu kluba.
              </p>
              <a
                href={klub.druzbena.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-85"
              >
                <InstagramIkona className="size-4" />
                Odpri @nsk_klub
              </a>
            </div>
          )}
        </div>

        <FacebookStran />
      </div>
    </section>
  );
}
