"use client";

import { useState, useTransition } from "react";
import { KeyRound, Loader2 } from "lucide-react";

import { setPasswordAction } from "@/app/actions/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { ActionState } from "@/types/app";

const initialState: ActionState = {};

export function SetPasswordForm() {
  const [state, setState] = useState<ActionState>(initialState);
  const [pending, startSubmit] = useTransition();

  function submit(formData: FormData) {
    startSubmit(async () => {
      setState(await setPasswordAction(initialState, formData));
    });
  }

  return (
    <form action={submit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="password">Novo geslo</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          placeholder="Vsaj 8 znakov"
          className="h-12"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirm">Ponovi geslo</Label>
        <Input
          id="confirm"
          name="confirm"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="h-12"
        />
      </div>

      {state.error ? (
        <div
          aria-live="polite"
          className="rounded-xl border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {state.error}
        </div>
      ) : null}

      <Button
        type="submit"
        size="lg"
        disabled={pending}
        className="h-12 w-full justify-center text-base font-semibold"
      >
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Shranjujem ...
          </>
        ) : (
          <>
            <KeyRound className="size-4" />
            Shrani geslo in nadaljuj
          </>
        )}
      </Button>
    </form>
  );
}
