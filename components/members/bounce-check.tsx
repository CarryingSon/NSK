"use client";

import { useActionState } from "react";
import { Loader2, MailWarning } from "lucide-react";

import { checkBouncesAction } from "@/app/actions/members";
import { Button } from "@/components/ui/button";
import type { ActionState } from "@/types/app";

const initialState: ActionState = {};

/**
 * Vrstica nad seznamom: koliko naslovov ne deluje in gumb za takojšen pregled
 * nabiralnika. Pregled teče tudi sam vsako jutro.
 */
export function BounceCheck({ bouncedCount }: { bouncedCount: number }) {
  const [state, action, pending] = useActionState(
    () => checkBouncesAction(),
    initialState,
  );

  return (
    <div className="flex flex-col gap-3 rounded-[14px] border border-border bg-card px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="inline-block size-2 rounded-full bg-destructive" aria-hidden />
        {bouncedCount === 0
          ? "Vsi e-naslovi na seznamu delujejo."
          : `Nedelujočih e-naslovov na seznamu: ${bouncedCount}. Ti člani obvestil ne dobijo.`}
        {state.success ? <span className="text-foreground">{state.success}</span> : null}
        {state.error ? <span className="text-destructive">{state.error}</span> : null}
      </p>
      <form action={action}>
        <Button type="submit" variant="outline" size="sm" disabled={pending}>
          {pending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <MailWarning className="size-4" />
          )}
          Preveri vrnjeno pošto
        </Button>
      </form>
    </div>
  );
}
