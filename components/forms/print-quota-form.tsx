"use client";

import { useActionState } from "react";

import { setPrintQuotaAction } from "@/app/actions/print-records";
import { SubmitButton } from "@/components/forms/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ActionState } from "@/types/app";

const initialState: ActionState = {};

export function PrintQuotaForm({ quota }: { quota: number }) {
  const [state, formAction] = useActionState(setPrintQuotaAction, initialState);

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-4">
      <div className="w-40 space-y-1.5">
        <Label htmlFor="quota">Kopij na člana</Label>
        {/* key ob spremembi kvote polje na novo priklopi, sicer Base UI opozori,
            da se defaultValue nekontroliranega polja spreminja po inicializaciji. */}
        <Input
          key={quota}
          id="quota"
          name="quota"
          type="number"
          min="1"
          step="1"
          defaultValue={quota}
          required
        />
      </div>

      <SubmitButton type="submit" pendingLabel="Shranjujem ...">
        Shrani kvoto
      </SubmitButton>

      {state.error ? (
        <p className="w-full text-sm text-destructive">{state.error}</p>
      ) : null}
      {state.success ? (
        <p className="w-full text-sm text-success">{state.success}</p>
      ) : null}
    </form>
  );
}
