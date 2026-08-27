"use client";

import { useActionState, useEffect, useRef } from "react";

import { createPrintRecordAction } from "@/app/actions/print-records";
import { SubmitButton } from "@/components/forms/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { getMemberFullName } from "@/lib/format";
import type { ActionState, MemberOption } from "@/types/app";

const initialState: ActionState = {};

export function PrintRecordForm({ members }: { members: MemberOption[] }) {
  const [state, formAction] = useActionState(createPrintRecordAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  return (
    <form ref={formRef} action={formAction} className="space-y-5">
      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="title">Naziv tiskovine</Label>
          <Input
            id="title"
            name="title"
            required
            placeholder="Npr. plakat za dogodek, letak, skripta ..."
            className="h-11 rounded-2xl bg-white/75 px-4"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="member_id">Povezan član</Label>
          <NativeSelect id="member_id" name="member_id" defaultValue="">
            <option value="">Brez povezanega člana</option>
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {getMemberFullName(member)}
              </option>
            ))}
          </NativeSelect>
        </div>

        <div className="space-y-2">
          <Label htmlFor="quantity">Količina</Label>
          <Input
            id="quantity"
            name="quantity"
            type="number"
            min="1"
            step="1"
            defaultValue="1"
            className="h-11 rounded-2xl bg-white/75 px-4"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="notes">Opombe</Label>
          <Textarea
            id="notes"
            name="notes"
            placeholder="Dodatne informacije o naročilu ali izdaji ..."
            className="min-h-24 rounded-[1.5rem] bg-white/75 px-4 py-3"
          />
        </div>
      </div>

      {state.error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {state.error}
        </div>
      ) : null}

      {state.success ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {state.success}
        </div>
      ) : null}

      <SubmitButton
        type="submit"
        pendingLabel="Shranjujem zapis ..."
        className="h-12 rounded-2xl px-6 text-base font-semibold shadow-lg shadow-primary/20"
      >
        Dodaj zapis tiska
      </SubmitButton>
    </form>
  );
}
