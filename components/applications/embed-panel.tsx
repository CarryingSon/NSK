"use client";

import { useState } from "react";
import { Check, Copy, ExternalLink } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Koda za vgradnjo obrazca v klubsko spletno stran.
 *
 * iframe je namenoma edina ponujena pot: obrazec ostane na našem gostitelju,
 * zato se popravki poznajo takoj in na tujo stran ne nosimo ne skript ne
 * dostopa do baze.
 */
export function EmbedPanel({
  formUrl,
  snippet,
}: {
  formUrl: string;
  snippet: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Brskalnik brez dovoljenja za odložišče: kodo se da označiti in kopirati ročno.
      setCopied(false);
    }
  }

  return (
    <section className="surface-card rounded-[18px] border border-border p-6 sm:p-7">
      <h2 className="font-heading text-2xl font-semibold text-foreground">
        Obrazec za vgradnjo na spletno stran
      </h2>
      <p className="mt-2 text-[0.9375rem] leading-6 text-muted-foreground">
        Kodo prilepi v blok HTML na klubski spletni strani. Obrazec se prikaže na
        strani, oddane prijave pa priletijo v zavihek Spletne prijave.
      </p>

      <div className="mt-6 space-y-3">
        <h3 className="text-sm font-medium text-foreground">
          HTML koda za vgradnjo (iframe)
        </h3>
        <pre className="overflow-x-auto rounded-[14px] border border-border bg-muted/60 px-4 py-3.5 font-mono text-[0.8125rem] leading-6 text-foreground">
          <code>{snippet}</code>
        </pre>

        <div className="flex flex-wrap items-center gap-3">
          <Button type="button" variant="secondary" onClick={copy}>
            {copied ? (
              <>
                <Check className="size-4" />
                Kopirano
              </>
            ) : (
              <>
                <Copy className="size-4" />
                Kopiraj
              </>
            )}
          </Button>

          <a
            href={formUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            <ExternalLink className="size-4" />
            Predogled obrazca
          </a>
        </div>
      </div>

      <div className="mt-7 border-t border-border pt-6">
        <h3 className="text-sm font-medium text-foreground">Navodila</h3>
        <ol className="mt-3 space-y-2">
          {[
            "Kopiraj zgornjo kodo za vgradnjo.",
            "V urejevalniku spletne strani dodaj blok HTML (v WordPressu se imenuje Custom HTML).",
            "Prilepi kodo v blok in shrani stran.",
            "Obrazec se prikaže na strani in deluje takoj.",
            "Oddane prijave se prikažejo v zavihku Spletne prijave.",
          ].map((step, index) => (
            <li
              key={step}
              className="flex gap-3 text-[0.9375rem] leading-6 text-muted-foreground"
            >
              <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/12 text-xs font-semibold text-primary">
                {index + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-6 rounded-[14px] border border-border bg-muted/50 px-4 py-3 text-xs leading-5 text-muted-foreground">
        Višina okvirja je nastavljena na 1400 px. Če se obrazec na strani obreže,
        v kodi povečaj vrednost <code className="font-mono">height</code>.
      </div>
    </section>
  );
}
