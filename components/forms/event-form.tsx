"use client";

import { useActionState } from "react";

import { saveEventAction } from "@/app/actions/events";
import { SubmitButton } from "@/components/forms/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { eventStatusOptions } from "@/lib/constants";
import { toDateTimeLocalInputValue } from "@/lib/format";
import type { ActionState, Event } from "@/types/app";

const initialState: ActionState = {};

export function EventForm({ event }: { event?: Event | null }) {
  const [state, formAction] = useActionState(saveEventAction, initialState);

  return (
    <form action={formAction} className="space-y-5">
      {event ? <input type="hidden" name="id" value={event.id} /> : null}

      <div className="space-y-2">
        <Label htmlFor="title">Naslov</Label>
        <Input
          id="title"
          name="title"
          defaultValue={event?.title ?? ""}
          required
          className="h-11 rounded-2xl bg-white/75 px-4"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Opis</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={event?.description ?? ""}
          className="min-h-28 rounded-[1.5rem] bg-white/75 px-4 py-3"
        />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="location">Lokacija</Label>
          <Input
            id="location"
            name="location"
            defaultValue={event?.location ?? ""}
            className="h-11 rounded-2xl bg-white/75 px-4"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status dogodka</Label>
          <NativeSelect
            id="status"
            name="status"
            defaultValue={event?.status ?? "upcoming"}
          >
            {eventStatusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </NativeSelect>
        </div>
        <div className="space-y-2">
          <Label htmlFor="starts_at">Datum začetka</Label>
          <Input
            id="starts_at"
            name="starts_at"
            type="datetime-local"
            defaultValue={toDateTimeLocalInputValue(event?.starts_at)}
            required
            className="h-11 rounded-2xl bg-white/75 px-4"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ends_at">Datum konca</Label>
          <Input
            id="ends_at"
            name="ends_at"
            type="datetime-local"
            defaultValue={toDateTimeLocalInputValue(event?.ends_at)}
            className="h-11 rounded-2xl bg-white/75 px-4"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="max_attendees">Maksimalno število prijav</Label>
          <Input
            id="max_attendees"
            name="max_attendees"
            type="number"
            min="1"
            defaultValue={event?.max_attendees ?? ""}
            className="h-11 rounded-2xl bg-white/75 px-4"
          />
        </div>
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
        {event ? "Shrani dogodek" : "Ustvari dogodek"}
      </SubmitButton>
    </form>
  );
}
