"use client";

import { useState, useTransition } from "react";
import { Check, Loader2, RotateCcw, UserPlus, X } from "lucide-react";

import {
  createMemberFromApplicationAction,
  setApplicationStatusAction,
} from "@/app/actions/applications";
import { Button } from "@/components/ui/button";
import type { ActionState, ApplicationStatus } from "@/types/app";

const initialState: ActionState = {};

/**
 * Ukrepi nad eno prijavo. Kateri gumbi se pokažejo, je odvisno od stanja:
 * prijavo v obdelavi se odobri ali zavrne, odobreno se prenese med člane,
 * obdelano se lahko vrne v obdelavo.
 */
export function ApplicationActions({
  id,
  status,
  hasMember,
}: {
  id: string;
  status: ApplicationStatus;
  hasMember: boolean;
}) {
  const [state, setState] = useState<ActionState>(initialState);
  const [pending, startAction] = useTransition();

  function changeStatus(next: ApplicationStatus) {
    startAction(async () => {
      const formData = new FormData();
      formData.set("id", id);
      formData.set("status", next);
      await setApplicationStatusAction(formData);
      setState(initialState);
    });
  }

  function transferToMembers() {
    startAction(async () => {
      const formData = new FormData();
      formData.set("id", id);
      setState(await createMemberFromApplicationAction(initialState, formData));
    });
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      <div className="flex items-center justify-end gap-1.5">
        {pending ? (
          <Loader2 className="size-4 animate-spin text-muted-foreground" />
        ) : null}

        {status === "pending" ? (
          <>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={pending}
              onClick={() => changeStatus("approved")}
              className="text-success"
            >
              <Check className="size-4" />
              Odobri
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={pending}
              onClick={() => changeStatus("rejected")}
              className="text-destructive"
            >
              <X className="size-4" />
              Zavrni
            </Button>
          </>
        ) : (
          <>
            {status === "approved" && !hasMember ? (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={pending}
                onClick={transferToMembers}
              >
                <UserPlus className="size-4" />
                Prenesi med člane
              </Button>
            ) : null}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={pending}
              onClick={() => changeStatus("pending")}
              className="text-muted-foreground"
            >
              <RotateCcw className="size-4" />
              V obdelavo
            </Button>
          </>
        )}
      </div>

      {state.error ? (
        <p className="max-w-64 text-right text-xs leading-4 text-destructive">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="max-w-64 text-right text-xs leading-4 text-success">
          {state.success}
        </p>
      ) : null}
    </div>
  );
}
