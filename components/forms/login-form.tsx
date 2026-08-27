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
          Uporabniško ime ali e-pošta
        </Label>
        <Input
          id="email"
          name="email"
          type="text"
          autoComplete="username"
          required
          disabled={disabled}
          placeholder="admin"
          className="h-12 rounded-xl bg-card px-4"
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
          autoComplete="current-password"
          required
          disabled={disabled}
          placeholder="Vnesi geslo"
          className="h-12 rounded-xl bg-card px-4"
        />
      </div>

      {state.error ? (
        <div className="rounded-xl border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {state.error}
        </div>
      ) : null}

      <SubmitButton
        type="submit"
        disabled={disabled}
        pendingLabel="Prijavljam ..."
        className="h-12 w-full rounded-full text-base font-semibold"
      >
        Prijava
      </SubmitButton>
    </form>
  );
}
