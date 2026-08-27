"use client";

import { useActionState, useState } from "react";
import { UserPlus } from "lucide-react";

import { addPrintCopiesAction } from "@/app/actions/print-records";
import { SubmitButton } from "@/components/forms/submit-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { getMemberFullName } from "@/lib/format";
import type { ActionState, MemberOption } from "@/types/app";

const initialState: ActionState = {};

/**
 * Član se v mesečnem pregledu pojavi šele, ko ima zabeležene kopije, zato je
 * "dodajanje člana" v resnici prvi vpis porabe zanj.
 */
export function AddMemberCopies({ members }: { members: MemberOption[] }) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState(addPrintCopiesAction, initialState);

  if (!open) {
    return (
      <Button type="button" onClick={() => setOpen(true)}>
        <UserPlus className="size-4" />
        Dodaj člana
      </Button>
    );
  }

  return (
    <div className="surface-muted w-full rounded-[14px] p-5">
      <form action={formAction} className="flex flex-wrap items-end gap-4">
        <div className="min-w-56 flex-1 space-y-1.5">
          <Label htmlFor="print-member">Član</Label>
          <NativeSelect id="print-member" name="member_id" defaultValue="" required>
            <option value="" disabled>
              Izberi člana
            </option>
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {getMemberFullName(member)}
              </option>
            ))}
          </NativeSelect>
        </div>

        <div className="w-32 space-y-1.5">
          <Label htmlFor="print-quantity">Kopije</Label>
          <Input
            id="print-quantity"
            name="quantity"
            type="number"
            min="1"
            step="1"
            defaultValue="1"
            required
          />
        </div>

        <div className="min-w-48 flex-1 space-y-1.5">
          <Label htmlFor="print-note">Opomba (neobvezno)</Label>
          <Input id="print-note" name="note" placeholder="Npr. skripta za izpit" />
        </div>

        <SubmitButton type="submit" pendingLabel="Shranjujem ...">
          Zabeleži
        </SubmitButton>

        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
          Prekliči
        </Button>

        {state.error ? (
          <p className="w-full text-sm text-destructive">{state.error}</p>
        ) : null}
        {state.success ? (
          <p className="w-full text-sm text-success">{state.success}</p>
        ) : null}
      </form>
    </div>
  );
}
