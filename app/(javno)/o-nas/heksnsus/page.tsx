import type { Metadata } from "next";
import { BookOpen } from "lucide-react";

import { NaslovStrani } from "@/components/javna/naslov-strani";
import { heksnsus } from "@/lib/klub";

export const metadata: Metadata = {
  title: "Heksnšus",
  description: "Arhiv klubskega glasila Heksnšus.",
};

export default function HeksnsusStran() {
  return (
    <>
      <NaslovStrani
        naslov="Heksnšus"
        opis="Klubsko glasilo. Starejše številke so na voljo v arhivu."
      />

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="display-md">Arhiv</h2>
        <ul className="mt-8 grid gap-5 sm:grid-cols-3">
          {heksnsus.map((stevilka) => (
            <li key={stevilka.datoteka}>
              <a
                href={`/heksnsus/${stevilka.datoteka}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-full flex-col rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/40"
              >
                <BookOpen className="size-6 text-primary" aria-hidden="true" />
                <span className="font-heading mt-4 text-lg font-semibold">
                  {stevilka.naslov}
                </span>
                <span className="badge mt-4 self-start">PDF</span>
              </a>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
