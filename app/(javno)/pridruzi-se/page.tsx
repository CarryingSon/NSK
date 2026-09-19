import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, FileCheck, FileText, MonitorSmartphone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { NaslovStrani } from "@/components/javna/naslov-strani";
import { klub } from "@/lib/klub";

export const metadata: Metadata = {
  title: "Včlani se",
  description:
    "Kaj potrebuješ za včlanitev v Notranjski študentski klub in kako se včlaniš - v klubu ali prek spletnega obrazca.",
};

const potrebujes = [
  {
    ikona: FileCheck,
    naslov: "Potrdilo o vpisu",
    opis: "Originalno potrdilo o vpisu za tekoče šolsko oziroma študijsko leto.",
  },
  {
    ikona: FileText,
    naslov: "Pristopna izjava",
    opis: "Izpolnjena pristopna izjava, ki je del spletnega obrazca.",
  },
];

export default function PridruziSeStran() {
  return (
    <>
      <NaslovStrani
        naslov="Včlani se v NŠK"
        opis={`Si študent ali dijak s stalnim prebivališčem v občini ${klub.obcine.join(", ")}? Včlani se in izkoristi ugodnosti, ki ti pripadajo.`}
      />

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="display-md">Kaj potrebuješ</h2>
        <ul className="mt-8 grid gap-5 sm:grid-cols-2">
          {potrebujes.map((postavka) => (
            <li
              key={postavka.naslov}
              className="rounded-2xl border border-border bg-card p-6"
            >
              <postavka.ikona className="size-6 text-primary" aria-hidden="true" />
              <h3 className="font-heading mt-4 text-lg font-semibold">
                {postavka.naslov}
              </h3>
              <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted-foreground">
                {postavka.opis}
              </p>
            </li>
          ))}
        </ul>

        <h2 className="display-md mt-16">Kako in kdaj</h2>
        <ol className="mt-8 grid gap-5 sm:grid-cols-2">
          <li className="rounded-2xl border border-border bg-card p-6">
            <span className="badge">1</span>
            <h3 className="font-heading mt-4 flex items-center gap-2 text-lg font-semibold">
              <MonitorSmartphone className="size-5 text-primary" aria-hidden="true" />
              Spletni obrazec
            </h3>
            <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted-foreground">
              Izpolniš ga kadarkoli, potrdilo o vpisu pripneš kar v obrazcu.
            </p>
            <Button
              render={<Link href="/vclanitev" />}
              nativeButton={false}
              className="mt-5"
            >
              Izpolni obrazec
            </Button>
          </li>
          <li className="rounded-2xl border border-border bg-card p-6">
            <span className="badge">2</span>
            <h3 className="font-heading mt-4 flex items-center gap-2 text-lg font-semibold">
              <CalendarDays className="size-5 text-primary" aria-hidden="true" />
              V klubu
            </h3>
            <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted-foreground">
              Oglasi se v času uradnih ur: {klub.uradneUre}.
            </p>
            <p className="mt-4 text-[0.9375rem] text-muted-foreground">
              {klub.naslov.ulica}
              <br />
              {klub.naslov.posta}
            </p>
          </li>
        </ol>
      </section>
    </>
  );
}
