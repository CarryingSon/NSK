"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { navigacija } from "@/components/javna/navigacija";
import { cn } from "@/lib/utils";

export function Glava() {
  const pot = usePathname();
  const [odprtMeni, setOdprtMeni] = useState(false);
  const [odprtSpust, setOdprtSpust] = useState<string | null>(null);
  const spustRef = useRef<HTMLUListElement>(null);

  // Ob menjavi strani mora vse ostati zaprto, sicer meni visi čez novo vsebino.
  // Zapremo ob kliku in ne v učinku na pot: setState v učinku sproži dodaten
  // izris, kar pravilo react-hooks/set-state-in-effect upravičeno zavrne.
  function zapriVse() {
    setOdprtMeni(false);
    setOdprtSpust(null);
  }

  // Klik izven spustnega menija ga zapre; brez tega ostane odprt, dokler
  // uporabnik ne zadene točno istega gumba.
  useEffect(() => {
    if (!odprtSpust) return;

    function obKliku(dogodek: MouseEvent) {
      if (!spustRef.current?.contains(dogodek.target as Node)) {
        setOdprtSpust(null);
      }
    }

    document.addEventListener("mousedown", obKliku);
    return () => document.removeEventListener("mousedown", obKliku);
  }, [odprtSpust]);

  function jeAktivna(povezava: { pot: string; podstrani?: unknown }) {
    if (povezava.pot === "/") return pot === "/";
    return pot === povezava.pot || pot.startsWith(`${povezava.pot}/`);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        {/* Logotip je napis "Notranjski študentski klub" v razmerju 5,3 : 1,
            zato se mu pusti naravno širino - ime kluba nosi že sam. */}
        <Link href="/" className="flex shrink-0 items-center">
          <Image
            src="/nsk-logo.svg"
            alt="Notranjski študentski klub"
            width={352}
            height={66}
            className="h-7 w-auto sm:h-8"
            priority
          />
        </Link>

        <nav aria-label="Glavna navigacija" className="hidden lg:block">
          <ul className="flex items-center gap-1" ref={spustRef}>
            {navigacija.map((povezava) => (
              <li key={povezava.pot} className="relative">
                {povezava.podstrani ? (
                  <>
                    <button
                      type="button"
                      aria-expanded={odprtSpust === povezava.pot}
                      onClick={() =>
                        setOdprtSpust((prej) =>
                          prej === povezava.pot ? null : povezava.pot,
                        )
                      }
                      className={cn(
                        "flex items-center gap-1 rounded-full px-3.5 py-2 text-sm font-medium transition-colors hover:bg-muted",
                        jeAktivna(povezava) && "text-primary",
                      )}
                    >
                      {povezava.naslov}
                      <ChevronDown
                        className={cn(
                          "size-3.5 transition-transform",
                          odprtSpust === povezava.pot && "rotate-180",
                        )}
                      />
                    </button>
                    {odprtSpust === povezava.pot ? (
                      <ul
                        onClick={zapriVse}
                        className="absolute top-full left-0 mt-2 min-w-56 rounded-xl border border-border bg-popover p-1.5 shadow-lg"
                      >
                        {povezava.podstrani.map((podstran) => (
                          <li key={podstran.pot}>
                            <Link
                              href={podstran.pot}
                              className={cn(
                                "block rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted",
                                pot === podstran.pot && "text-primary",
                              )}
                            >
                              {podstran.naslov}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </>
                ) : (
                  <Link
                    href={povezava.pot}
                    aria-current={jeAktivna(povezava) ? "page" : undefined}
                    className={cn(
                      "block rounded-full px-3.5 py-2 text-sm font-medium transition-colors hover:bg-muted",
                      jeAktivna(povezava) && "text-primary",
                    )}
                  >
                    {povezava.naslov}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <Button
            render={<Link href="/vclanitev" />}
            nativeButton={false}
            size="sm"
            className="hidden sm:inline-flex"
          >
            Včlani se
          </Button>
          <button
            type="button"
            aria-label={odprtMeni ? "Zapri meni" : "Odpri meni"}
            aria-expanded={odprtMeni}
            onClick={() => setOdprtMeni((prej) => !prej)}
            className="rounded-full p-2 transition-colors hover:bg-muted lg:hidden"
          >
            {odprtMeni ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {odprtMeni ? (
        <nav
          aria-label="Glavna navigacija"
          className="border-t border-border/60 bg-background lg:hidden"
        >
          <ul
            onClick={zapriVse}
            className="mx-auto max-w-6xl space-y-1 px-4 py-4 sm:px-6"
          >
            {navigacija.map((povezava) => (
              <li key={povezava.pot}>
                {povezava.podstrani ? (
                  <>
                    <p className="px-3 pt-3 pb-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                      {povezava.naslov}
                    </p>
                    <ul>
                      {povezava.podstrani.map((podstran) => (
                        <li key={podstran.pot}>
                          <Link
                            href={podstran.pot}
                            className="block rounded-lg px-3 py-2.5 text-[0.9375rem] transition-colors hover:bg-muted"
                          >
                            {podstran.naslov}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <Link
                    href={povezava.pot}
                    aria-current={jeAktivna(povezava) ? "page" : undefined}
                    className={cn(
                      "block rounded-lg px-3 py-2.5 text-[0.9375rem] font-medium transition-colors hover:bg-muted",
                      jeAktivna(povezava) && "text-primary",
                    )}
                  >
                    {povezava.naslov}
                  </Link>
                )}
              </li>
            ))}
            <li className="pt-3">
              <Button
                render={<Link href="/vclanitev" />}
                nativeButton={false}
                className="w-full"
              >
                Včlani se
              </Button>
            </li>
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
