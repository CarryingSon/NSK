import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { izvlecek, ocistiHtml, pridobiNovico } from "@/lib/novice";

type Lastnosti = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Lastnosti): Promise<Metadata> {
  const { id } = await params;
  const novica = await pridobiNovico(Number(id));

  if (!novica) {
    return { title: "Novica ni najdena" };
  }

  return {
    title: novica.naslov,
    description: izvlecek(novica.vsebina, 155),
  };
}

export default async function NovicaStran({ params }: Lastnosti) {
  const { id } = await params;
  const stevilka = Number(id);

  if (!Number.isFinite(stevilka)) {
    notFound();
  }

  const novica = await pridobiNovico(stevilka);

  if (!novica) {
    notFound();
  }

  return (
    <article className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
      <Link
        href="/aktualno"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Nazaj na aktualno
      </Link>

      <h1 className="display-lg mt-6 text-balance">{novica.naslov}</h1>

      {novica.slika ? (
        <div className="relative mt-8 aspect-[16/10] overflow-hidden rounded-2xl bg-muted">
          <Image
            src={novica.slika}
            alt=""
            fill
            sizes="(min-width: 768px) 768px, 100vw"
            className="object-cover"
            priority
          />
        </div>
      ) : null}

      {/* Vsebina prihaja iz starega CMS-a kot HTML; ocistiHtml() pred izrisom
          pusti le oznake, ki jih objava potrebuje. */}
      <div
        className="objava mt-10"
        dangerouslySetInnerHTML={{ __html: ocistiHtml(novica.vsebina) }}
      />
    </article>
  );
}
