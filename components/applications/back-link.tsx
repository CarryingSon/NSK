"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

/**
 * "Nazaj" z obrazca za včlanitev.
 *
 * Na obrazec vodijo gumbi z več strani (naslovnica, Pridruži se, Ugodnosti,
 * glava), zato se vrne tja, od koder je obiskovalec prišel. Kdor je prišel od
 * drugod (iskalnik, povezava v sporočilu), pristane na naslovnici. Brez
 * JavaScripta deluje kot navadna povezava na naslovnico.
 */
export function BackLink() {
  return (
    <Link
      href="/"
      onClick={(event) => {
        try {
          if (
            document.referrer &&
            new URL(document.referrer).origin === window.location.origin &&
            window.history.length > 1
          ) {
            event.preventDefault();
            window.history.back();
          }
        } catch {
          // Neveljaven referrer - ostane povezava na naslovnico.
        }
      }}
      className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
    >
      <ArrowLeft className="size-4" aria-hidden="true" />
      Nazaj
    </Link>
  );
}
