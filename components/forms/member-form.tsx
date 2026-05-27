"use client";

import { useActionState } from "react";

import { saveMemberAction } from "@/app/actions/members";
import { SubmitButton } from "@/components/forms/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { membershipStatusOptions } from "@/lib/constants";
import { toDateInputValue } from "@/lib/format";
import type { ActionState, Member } from "@/types/app";

const initialState: ActionState = {};

export function MemberForm({ member }: { member?: Member | null }) {
  const [state, formAction] = useActionState(saveMemberAction, initialState);

  return (
    <form action={formAction} className="space-y-8">
      {member ? <input type="hidden" name="id" value={member.id} /> : null}

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="first_name">Ime</Label>
          <Input
            id="first_name"
            name="first_name"
            defaultValue={member?.first_name ?? ""}
            required
            className="h-11 rounded-2xl bg-white/75 px-4"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="last_name">Priimek</Label>
          <Input
            id="last_name"
            name="last_name"
            defaultValue={member?.last_name ?? ""}
            required
            className="h-11 rounded-2xl bg-white/75 px-4"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">E-pošta</Label>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={member?.email ?? ""}
            className="h-11 rounded-2xl bg-white/75 px-4"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Telefonska številka</Label>
          <Input
            id="phone"
            name="phone"
            defaultValue={member?.phone ?? ""}
            className="h-11 rounded-2xl bg-white/75 px-4"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="birth_date">Datum rojstva</Label>
          <Input
            id="birth_date"
            name="birth_date"
            type="date"
            defaultValue={toDateInputValue(member?.birth_date)}
            className="h-11 rounded-2xl bg-white/75 px-4"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="joined_at">Datum včlanitve</Label>
          <Input
            id="joined_at"
            name="joined_at"
            type="date"
            defaultValue={toDateInputValue(member?.joined_at)}
            className="h-11 rounded-2xl bg-white/75 px-4"
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="address">Naslov</Label>
          <Input
            id="address"
            name="address"
            defaultValue={member?.address ?? ""}
            className="h-11 rounded-2xl bg-white/75 px-4"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="postal_code">Poštna številka</Label>
          <Input
            id="postal_code"
            name="postal_code"
            defaultValue={member?.postal_code ?? ""}
            className="h-11 rounded-2xl bg-white/75 px-4"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="city">Mesto</Label>
          <Input
            id="city"
            name="city"
            defaultValue={member?.city ?? ""}
            className="h-11 rounded-2xl bg-white/75 px-4"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="membership_status">Status članstva</Label>
          <NativeSelect
            id="membership_status"
            name="membership_status"
            defaultValue={member?.membership_status ?? "active"}
          >
            {membershipStatusOptions.map((statusOption) => (
              <option key={statusOption.value} value={statusOption.value}>
                {statusOption.label}
              </option>
            ))}
          </NativeSelect>
        </div>
        <div className="space-y-2">
          <Label htmlFor="membership_year">Leto članstva</Label>
          <Input
            id="membership_year"
            name="membership_year"
            type="number"
            defaultValue={member?.membership_year ?? ""}
            placeholder="2026"
            className="h-11 rounded-2xl bg-white/75 px-4"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="membership_fee">Znesek članarine</Label>
          <Input
            id="membership_fee"
            name="membership_fee"
            type="number"
            min="0"
            step="0.01"
            defaultValue={member?.membership_fee ?? ""}
            className="h-11 rounded-2xl bg-white/75 px-4"
          />
        </div>
        <div className="flex items-center justify-between rounded-[1.5rem] border border-white/70 bg-white/70 px-4 py-3">
          <div>
            <p className="font-medium text-foreground">Članarina plačana</p>
            <p className="text-sm text-muted-foreground">
              Označi, če je članarina že poravnana.
            </p>
          </div>
          <input
            id="membership_paid"
            name="membership_paid"
            type="checkbox"
            defaultChecked={member?.membership_paid ?? false}
            className="size-5 rounded border-border accent-[#ffd51e]"
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="notes">Opombe</Label>
          <Textarea
            id="notes"
            name="notes"
            defaultValue={member?.notes ?? ""}
            placeholder="Dodatne informacije o članu ..."
            className="min-h-32 rounded-[1.5rem] bg-white/75 px-4 py-3"
          />
        </div>
      </div>

      {state.error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {state.error}
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SubmitButton
          type="submit"
          pendingLabel={member ? "Shranjujem ..." : "Dodajam ..."}
          className="h-12 rounded-2xl px-6 text-base font-semibold shadow-lg shadow-primary/20"
        >
          {member ? "Shrani spremembe" : "Dodaj člana"}
        </SubmitButton>
      </div>
    </form>
  );
}
