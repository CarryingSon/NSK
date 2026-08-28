"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Loader2, UserPlus } from "lucide-react";

import { inviteUserAction } from "@/app/actions/users";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Button } from "@/components/ui/button";
import { appRoleDescriptions, appRoleLabels, appRoles, type AppRole } from "@/lib/roles";
import type { ActionState } from "@/types/app";

const initialState: ActionState = {};

export function InviteUserForm({ disabled }: { disabled: boolean }) {
  const [state, setState] = useState<ActionState>(initialState);
  const [role, setRole] = useState<AppRole>("officer");
  const [pending, startSubmit] = useTransition();

  function submit(formData: FormData) {
    startSubmit(async () => {
      const result = await inviteUserAction(initialState, formData);
      setState(result);

      if (result.success) {
        const field = document.getElementById(
          "invite-email",
        ) as HTMLInputElement | null;
        field?.form?.reset();
        setRole("officer");
      }
    });
  }

  return (
    <form action={submit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_220px]">
        <div className="space-y-2">
          <Label htmlFor="invite-email">E-pošta</Label>
          <Input
            id="invite-email"
            name="email"
            type="email"
            required
            disabled={disabled}
            placeholder="ime.priimek@gmail.com"
            className="h-12"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="invite-role">Vloga</Label>
          <NativeSelect
            id="invite-role"
            name="role"
            value={role}
            disabled={disabled}
            onChange={(event) => setRole(event.target.value as AppRole)}
            className="h-12"
          >
            {appRoles.map((value) => (
              <option key={value} value={value}>
                {appRoleLabels[value]}
              </option>
            ))}
          </NativeSelect>
        </div>
      </div>

      <p className="text-xs leading-5 text-muted-foreground">
        {appRoleDescriptions[role]}
      </p>

      {state.error ? (
        <div
          aria-live="polite"
          className="rounded-xl border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {state.error}
        </div>
      ) : null}

      {state.success ? (
        <div
          aria-live="polite"
          className="flex items-start gap-2 rounded-xl border border-success/25 bg-success/10 px-4 py-3 text-sm text-success"
        >
          <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
          <span>{state.success}</span>
        </div>
      ) : null}

      <Button
        type="submit"
        size="lg"
        disabled={pending || disabled}
        className="h-12 px-6 text-base font-semibold"
      >
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Pošiljam povabilo ...
          </>
        ) : (
          <>
            <UserPlus className="size-4" />
            Pošlji povabilo
          </>
        )}
      </Button>
    </form>
  );
}
