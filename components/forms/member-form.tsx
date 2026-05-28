"use client";

import { useActionState } from "react";

import { saveMemberAction } from "@/app/actions/members";
import { SubmitButton } from "@/components/forms/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import {
  facultyOptionGroups,
  facultyOptions,
  membershipStatusOptions,
} from "@/lib/constants";
import { toDateInputValue } from "@/lib/format";
import type { ActionState, Member } from "@/types/app";

const initialState: ActionState = {};

export function MemberForm({ member }: { member?: Member | null }) {
  const [state, formAction] = useActionState(saveMemberAction, initialState);
  const currentFaculty = member?.faculty ?? "";
  const hasCustomFaculty =
    currentFaculty.length > 0 &&
    !facultyOptions.some((option) => option.value === currentFaculty);
  const defaultMembershipYear =
    member?.membership_year ?? new Date().getFullYear();
  const defaultJoinedAt =
    toDateInputValue(member?.joined_at) ||
    new Date().toISOString().slice(0, 10);
  const fieldClass =
    "h-12 rounded-xl border-slate-200 bg-white px-4 shadow-sm transition focus-visible:border-primary/40 focus-visible:ring-primary/10";
  const selectClass =
    "h-12 rounded-xl border-slate-200 bg-white px-4 shadow-sm focus:border-primary/40 focus:ring-primary/10";
  const textareaClass =
    "min-h-36 rounded-[1.25rem] border-slate-200 bg-white px-4 py-3 shadow-sm focus-visible:border-primary/40 focus-visible:ring-primary/10";
  const sectionClass =
    "rounded-[1.75rem] border border-slate-200/70 bg-white/70 p-5 sm:p-6";

  return (
    <form action={formAction} className="space-y-8">
      {member ? <input type="hidden" name="id" value={member.id} /> : null}

      <div className={sectionClass}>
        <div className="mb-5">
          <h2 className="font-heading text-2xl font-semibold text-foreground">
            Osnovni podatki
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Enak osnovni tok kot v GROŠ obrazcu: identiteta najprej, nato šola.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="first_name">Ime</Label>
            <Input
              id="first_name"
              name="first_name"
              defaultValue={member?.first_name ?? ""}
              placeholder="Maja"
              required
              className={fieldClass}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="last_name">Priimek</Label>
            <Input
              id="last_name"
              name="last_name"
              defaultValue={member?.last_name ?? ""}
              placeholder="Novak"
              required
              className={fieldClass}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="birth_date">Datum rojstva</Label>
            <Input
              id="birth_date"
              name="birth_date"
              type="date"
              defaultValue={toDateInputValue(member?.birth_date)}
              className={fieldClass}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="faculty">Fakulteta / visokošolski zavod</Label>
            <NativeSelect
              id="faculty"
              name="faculty"
              defaultValue={currentFaculty}
              required
              className={selectClass}
            >
              <option value="">Izberi fakulteto ali zavod</option>
              {hasCustomFaculty ? (
                <option value={currentFaculty}>{currentFaculty}</option>
              ) : null}
              {facultyOptionGroups.map((group) => (
                <optgroup key={group.label} label={group.label}>
                  {group.options.map((facultyOption) => (
                    <option key={facultyOption.value} value={facultyOption.value}>
                      {facultyOption.label}
                    </option>
                  ))}
                </optgroup>
              ))}
            </NativeSelect>
          </div>
        </div>
      </div>

      <div className={sectionClass}>
        <div className="mb-5">
          <h2 className="font-heading text-2xl font-semibold text-foreground">
            Kontakt in naslov
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Razpored polj sledi istemu praktičnemu zaporedju kot pri GROŠ-u.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="address">Ulica in hišna številka</Label>
            <Input
              id="address"
              name="address"
              defaultValue={member?.address ?? ""}
              placeholder="Cesta 1"
              className={fieldClass}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="postal_code">Poštna številka</Label>
            <Input
              id="postal_code"
              name="postal_code"
              defaultValue={member?.postal_code ?? ""}
              placeholder="1380"
              className={fieldClass}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">Mesto</Label>
            <Input
              id="city"
              name="city"
              defaultValue={member?.city ?? ""}
              placeholder="Cerknica"
              className={fieldClass}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Telefonska številka</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              defaultValue={member?.phone ?? ""}
              placeholder="031 123 456"
              className={fieldClass}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">E-pošta</Label>
            <Input
              id="email"
              name="email"
              type="email"
              defaultValue={member?.email ?? ""}
              placeholder="ime.priimek@email.si"
              className={fieldClass}
            />
          </div>
        </div>
      </div>

      <div className={sectionClass}>
        <div className="mb-5">
          <h2 className="font-heading text-2xl font-semibold text-foreground">
            Status članstva
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Brez članarine, samo administrativni status in letnica članstva.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="membership_status">Status članstva</Label>
            <NativeSelect
              id="membership_status"
              name="membership_status"
              defaultValue={member?.membership_status ?? "active"}
              className={selectClass}
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
              defaultValue={defaultMembershipYear}
              placeholder="2026"
              className={fieldClass}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="joined_at">Datum včlanitve</Label>
            <Input
              id="joined_at"
              name="joined_at"
              type="date"
              defaultValue={defaultJoinedAt}
              className={fieldClass}
            />
          </div>
        </div>
      </div>

      <div className={sectionClass}>
        <div className="space-y-2">
          <Label htmlFor="notes">Opombe</Label>
          <Textarea
            id="notes"
            name="notes"
            defaultValue={member?.notes ?? ""}
            placeholder="Dodatne informacije o članu ..."
            className={textareaClass}
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
