"use client";

import { useState, useTransition } from "react";
import { Loader2, Mail, Trash2 } from "lucide-react";

import {
  deleteUserAction,
  resendInviteAction,
  setUserRoleAction,
} from "@/app/actions/users";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { NativeSelect } from "@/components/ui/native-select";
import { appRoleLabels, appRoles, type AppRole } from "@/lib/roles";
import type { ActionState } from "@/types/app";

const initialState: ActionState = {};

export function UserRowActions({
  id,
  email,
  role,
  invitePending,
  isSelf,
}: {
  id: string;
  email: string;
  role: AppRole;
  invitePending: boolean;
  isSelf: boolean;
}) {
  const [state, setState] = useState<ActionState>(initialState);
  const [pending, startAction] = useTransition();

  function changeRole(next: AppRole) {
    startAction(async () => {
      const formData = new FormData();
      formData.set("id", id);
      formData.set("role", next);
      setState(await setUserRoleAction(initialState, formData));
    });
  }

  function resend() {
    startAction(async () => {
      const formData = new FormData();
      formData.set("email", email);
      formData.set("role", role);
      setState(await resendInviteAction(initialState, formData));
    });
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex items-center gap-2">
        {pending ? (
          <Loader2 className="size-4 animate-spin text-muted-foreground" />
        ) : null}

        <NativeSelect
          aria-label={`Vloga za ${email}`}
          value={role}
          // Sebi vloge ne moreš spremeniti - sicer se lahko zakleneš iz nastavitev.
          disabled={pending || isSelf}
          onChange={(event) => changeRole(event.target.value as AppRole)}
          className="h-9 w-40 text-sm"
        >
          {appRoles.map((value) => (
            <option key={value} value={value}>
              {appRoleLabels[value]}
            </option>
          ))}
        </NativeSelect>

        {invitePending ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={pending}
            onClick={resend}
          >
            <Mail className="size-4" />
            Pošlji znova
          </Button>
        ) : null}

        {isSelf ? null : (
          <AlertDialog>
            <AlertDialogTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-destructive"
                />
              }
            >
              <Trash2 className="size-4" />
              <span className="sr-only">Odstrani uporabnika</span>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-[18px] border border-border bg-card p-0">
              <AlertDialogHeader className="px-6 pt-6">
                <AlertDialogTitle>Odstranim uporabnika?</AlertDialogTitle>
                <AlertDialogDescription>
                  Račun <strong>{email}</strong> bo izbrisan in dostop do
                  aplikacije bo takoj ukinjen. Podatki kluba ostanejo
                  nedotaknjeni. Ta korak je nepovraten.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-xl">
                  Prekliči
                </AlertDialogCancel>
                <form action={deleteUserAction}>
                  <input type="hidden" name="id" value={id} />
                  <AlertDialogAction
                    type="submit"
                    variant="destructive"
                    className="rounded-xl"
                  >
                    <Trash2 className="size-4" />
                    Odstrani
                  </AlertDialogAction>
                </form>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {state.error ? (
        <p className="max-w-72 text-right text-xs leading-4 text-destructive">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="max-w-72 text-right text-xs leading-4 text-success">
          {state.success}
        </p>
      ) : null}
    </div>
  );
}
