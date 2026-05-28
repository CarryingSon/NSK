import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-20">
      <div className="surface-glass w-full max-w-lg rounded-[2rem] border border-white/60 p-10 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-muted-foreground">
          404
        </p>
        <h1 className="mt-4 font-heading text-4xl font-semibold text-foreground">
          Stran ni bila najdena
        </h1>
        <p className="mt-4 text-balance text-muted-foreground">
          Zahtevana vsebina ne obstaja ali pa trenutno ni več na voljo.
        </p>
        <div className="mt-8 flex justify-center">
          <Link
            href="/members"
            className={cn(
              buttonVariants({ variant: "default", size: "lg" }),
              "h-11 rounded-2xl px-6 shadow-lg shadow-primary/20",
            )}
          >
            Nazaj na nadzorno ploščo
          </Link>
        </div>
      </div>
    </main>
  );
}
