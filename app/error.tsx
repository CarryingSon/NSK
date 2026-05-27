"use client";

import { RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="sl">
      <body className="flex min-h-screen items-center justify-center px-6 py-20">
        <div className="surface-glass w-full max-w-lg rounded-[2rem] border border-white/60 p-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            Napaka
          </p>
          <h1 className="mt-4 font-heading text-4xl font-semibold text-foreground">
            Nekaj je šlo narobe
          </h1>
          <p className="mt-4 text-balance text-muted-foreground">
            {error.message || "Pri nalaganju aplikacije je prišlo do nepričakovane napake."}
          </p>
          <div className="mt-8 flex justify-center">
            <Button className="h-11 rounded-2xl px-6" onClick={reset}>
              <RotateCcw className="size-4" />
              Poskusi znova
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
}
