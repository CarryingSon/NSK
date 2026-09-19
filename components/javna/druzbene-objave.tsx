import { DruzbenaVgradnja } from "@/components/javna/druzbena-vgradnja";
import { FacebookIkona, InstagramIkona } from "@/components/javna/ikone";
import { klub } from "@/lib/klub";

/**
 * Razdelek "Sledi nam": časovnici obeh omrežij, vgrajeni druga ob drugi.
 *
 * Kartici sta enako visoki, ker si višino izračunata po isti meri - glej
 * `visinaVgradnje`.
 */
export function DruzbeneObjave() {
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
        <DruzbenaVgradnja
          omrezje="instagram"
          ikona={<InstagramIkona className="size-4 text-primary" />}
          naslov="Instagram"
          opis="Zadnje objave Notranjskega študentskega kluba na Instagramu"
        />
        <DruzbenaVgradnja
          omrezje="facebook"
          ikona={<FacebookIkona className="size-4 text-primary" />}
          naslov="Facebook"
          opis="Objave Notranjskega študentskega kluba na Facebooku"
        />
      </div>
    </section>
  );
}
