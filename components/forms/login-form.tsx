"use client";

import { useActionState } from "react";

import { loginAction } from "@/app/actions/auth";
import { SubmitButton } from "@/components/forms/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ActionState } from "@/types/app";

const initialState: ActionState = {};

export function LoginForm({
  redirectTo,
  disabled,
}: {
  redirectTo?: string;
  disabled?: boolean;
}) {
  const [state, formAction] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="redirectTo" value={redirectTo ?? ""} />

      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium text-foreground">
          E-pošta
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          disabled={disabled}
          placeholder="ime@studentski-klub.si"
          className="h-12 rounded-2xl bg-white/80 px-4 shadow-sm"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-sm font-medium text-foreground">
          Geslo
        </Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          disabled={disabled}
          placeholder="Vnesi geslo"
          className="h-12 rounded-2xl bg-white/80 px-4 shadow-sm"
        />
      </div>

      {state.error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {state.error}
        </div>
      ) : null}

      <SubmitButton
        type="submit"
        disabled={disabled}
        pendingLabel="Prijavljam ..."
        className="h-12 w-full rounded-2xl text-base font-semibold shadow-lg shadow-primary/20"
      >
        Prijava
      </SubmitButton>
    </form>
  );
}
