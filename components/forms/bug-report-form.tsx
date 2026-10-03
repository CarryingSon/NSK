"use client";

import { useActionState, useState } from "react";
import { usePathname } from "next/navigation";
import { ImagePlus, X } from "lucide-react";

import { reportBugAction } from "@/app/actions/feedback";
import { SubmitButton } from "@/components/forms/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ActionState } from "@/types/app";

const initialState: ActionState = {};

export function BugReportForm() {
  const [state, formAction] = useActionState(reportBugAction, initialState);
  const [imeSlike, setImeSlike] = useState<string | null>(null);
  // Po uspešni oddaji polja spraznimo tako, da obrazec priklopimo na novo.
  const [kljuc, setKljuc] = useState(0);
  const pot = usePathname();

  if (state.success && imeSlike !== null) {
    setImeSlike(null);
  }

  return (
    <form
      key={kljuc}
      action={async (formData: FormData) => {
        await formAction(formData);
      }}
      className="space-y-6"
    >
      {/* Iz katere strani je prijava prišla. Pot pove več kot opis po spominu. */}
      <input type="hidden" name="page" value={pot ?? ""} />

      <div className="space-y-1.5">
        <Label htmlFor="summary">Kaj je narobe?</Label>
        <Input
          id="summary"
          name="summary"
          required
          maxLength={120}
          placeholder="Npr. Gumb za shranjevanje ne stori nič"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="details">Opis</Label>
        <Textarea
          id="details"
          name="details"
          required
          rows={7}
          maxLength={4000}
          placeholder="Kaj si počel, kaj si pričakoval in kaj se je zgodilo namesto tega."
        />
        <p className="text-[0.8125rem] text-muted-foreground">
          Če se da, napiši korake, po katerih se napaka ponovi - tako jo je
          mogoče popraviti brez ugibanja.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="screenshot">Slika (neobvezno)</Label>
        <label
          htmlFor="screenshot"
          className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-border px-4 py-3.5 text-[0.9375rem] transition-colors hover:bg-muted"
        >
          <ImagePlus className="size-5 shrink-0 text-muted-foreground" />
          <span className="min-w-0 flex-1 truncate">
            {imeSlike ?? "Izberi zaslonsko sliko"}
          </span>
          {imeSlike ? (
            <span
              role="button"
              tabIndex={0}
              aria-label="Odstrani sliko"
              onClick={(dogodek) => {
                dogodek.preventDefault();
                setKljuc((prej) => prej + 1);
                setImeSlike(null);
              }}
              onKeyDown={(dogodek) => {
                if (dogodek.key === "Enter" || dogodek.key === " ") {
                  dogodek.preventDefault();
                  setKljuc((prej) => prej + 1);
                  setImeSlike(null);
                }
              }}
              className="shrink-0 rounded-full p-1 text-muted-foreground hover:bg-background hover:text-foreground"
            >
              <X className="size-4" />
            </span>
          ) : null}
        </label>
        <input
          id="screenshot"
          name="screenshot"
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif,image/heic"
          className="sr-only"
          onChange={(dogodek) => {
            const datoteka = dogodek.target.files?.[0];
            setImeSlike(datoteka ? datoteka.name : null);
          }}
        />
        <p className="text-[0.8125rem] text-muted-foreground">
          PNG, JPG, WEBP, GIF ali HEIC, do 5 MB.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <SubmitButton type="submit" pendingLabel="Pošiljam ...">
          Pošlji prijavo
        </SubmitButton>

        {state.error ? (
          <p className="text-sm text-destructive">{state.error}</p>
        ) : null}
        {state.success ? (
          <p className="text-sm text-success">{state.success}</p>
        ) : null}
      </div>
    </form>
  );
}
