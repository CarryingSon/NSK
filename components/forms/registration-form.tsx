"use client";

import { useActionState } from "react";

import { saveRegistrationAction } from "@/app/actions/registrations";
import { SubmitButton } from "@/components/forms/submit-button";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { registrationStatusOptions } from "@/lib/constants";
import { getMemberFullName } from "@/lib/format";
import type { ActionState, Event, Member, Registration } from "@/types/app";

const initialState: ActionState = {};

export function RegistrationForm({
  members,
  events,
  registration,
}: {
  members: Member[];
  events: Event[];
  registration?: Registration | null;
}) {
  const [state, formAction] = useActionState(saveRegistrationAction, initialState);

  return (
    <form action={formAction} className="space-y-5">
      {registration ? <input type="hidden" name="id" value={registration.id} /> : null}

      <div className="space-y-2">
        <Label htmlFor="member_id">Član</Label>
        <NativeSelect
          id="member_id"
          name="member_id"
          defaultValue={registration?.member_id ?? ""}
          required
        >
          <option value="" disabled>
            Izberi člana
          </option>
          {members.map((member) => (
            <option key={member.id} value={member.id}>
              {getMemberFullName(member)}
              {member.email ? ` · ${member.email}` : ""}
            </option>
          ))}
        </NativeSelect>
      </div>

      <div className="space-y-2">
        <Label htmlFor="event_id">Dogodek</Label>
        <NativeSelect
          id="event_id"
          name="event_id"
          defaultValue={registration?.event_id ?? ""}
          required
        >
          <option value="" disabled>
            Izberi dogodek
          </option>
          {events.map((event) => (
            <option key={event.id} value={event.id}>
              {event.title}
            </option>
          ))}
        </NativeSelect>
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status prijave</Label>
        <NativeSelect
          id="status"
          name="status"
          defaultValue={registration?.status ?? "registered"}
        >
          {registrationStatusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </NativeSelect>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Opombe</Label>
        <Textarea
          id="notes"
          name="notes"
          defaultValue={registration?.notes ?? ""}
          className="min-h-24 rounded-[1.5rem] bg-white/75 px-4 py-3"
        />
      </div>

      {state.error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {state.error}
        </div>
      ) : null}

      <SubmitButton
        type="submit"
        pendingLabel="Shranjujem ..."
        className="h-12 rounded-2xl px-6 text-base font-semibold shadow-lg shadow-primary/20"
      >
        {registration ? "Shrani prijavo" : "Dodaj prijavo"}
      </SubmitButton>
    </form>
  );
}
