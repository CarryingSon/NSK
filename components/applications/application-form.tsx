"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";

import { submitApplicationAction } from "@/app/actions/applications";
import { SearchableSelect } from "@/components/forms/searchable-select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { club, schoolOptionGroups } from "@/lib/constants";
import type { ActionState } from "@/types/app";

const initialState: ActionState = {};

function Field({
  label,
  htmlFor,
  hint,
  children,
  className,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className ? `space-y-2 ${className}` : "space-y-2"}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export function ApplicationForm() {
  const [state, setState] = useState<ActionState>(initialState);
  const [pending, startSubmit] = useTransition();

  function submit(formData: FormData) {
    startSubmit(async () => {
      setState(await submitApplicationAction(initialState, formData));
    });
  }

  if (state.success) {
    return (
      <div className="surface-card rounded-[18px] border border-border p-8 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-success/12 text-success">
          <CheckCircle2 className="size-7" />
        </div>
        <h2 className="mt-5 font-heading text-2xl font-semibold text-foreground">
          Prijava je oddana
        </h2>
        <p className="mx-auto mt-3 max-w-md text-[0.9375rem] leading-6 text-muted-foreground">
          {state.success}
        </p>
        <p className="mt-6 text-sm text-muted-foreground">
          Vprašanja?{" "}
          <a
            href={`mailto:${club.email}`}
            className="text-primary hover:underline"
          >
            {club.email}
          </a>
        </p>
      </div>
    );
  }

  return (
    <form action={submit} className="space-y-6">
      <section className="surface-card rounded-[18px] border border-border p-6 sm:p-7">
        <h2 className="font-heading text-xl font-semibold text-foreground">
          Osnovni podatki
        </h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <Field label="Ime" htmlFor="first_name">
            <Input id="first_name" name="first_name" required className="h-12" />
          </Field>
          <Field label="Priimek" htmlFor="last_name">
            <Input id="last_name" name="last_name" required className="h-12" />
          </Field>
          <Field label="E-pošta" htmlFor="email">
            <Input
              id="email"
              name="email"
              type="email"
              required
              className="h-12"
            />
          </Field>
          <Field label="Telefon" htmlFor="phone">
            <Input id="phone" name="phone" type="tel" className="h-12" />
          </Field>
          <Field label="Datum rojstva" htmlFor="birth_date">
            <Input
              id="birth_date"
              name="birth_date"
              type="date"
              className="h-12"
            />
          </Field>
          <Field
            label="EMŠO"
            htmlFor="emso"
            hint="13 števk. Klub ga potrebuje za evidenco članstva."
          >
            <Input
              id="emso"
              name="emso"
              inputMode="numeric"
              maxLength={13}
              pattern="[0-9]{13}"
              placeholder="13 števk"
              required
              className="h-12"
            />
          </Field>
        </div>
      </section>

      <section className="surface-card rounded-[18px] border border-border p-6 sm:p-7">
        <h2 className="font-heading text-xl font-semibold text-foreground">
          Naslov stalnega prebivališča
        </h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <Field
            label="Ulica in hišna številka"
            htmlFor="address"
            className="sm:col-span-2"
          >
            <Input id="address" name="address" className="h-12" />
          </Field>
          <Field label="Poštna številka" htmlFor="postal_code">
            <Input id="postal_code" name="postal_code" className="h-12" />
          </Field>
          <Field label="Kraj" htmlFor="city">
            <Input id="city" name="city" className="h-12" />
          </Field>
        </div>
        <p className="mt-4 text-xs leading-5 text-muted-foreground">
          V klub se lahko včlanijo študenti in dijaki s stalnim prebivališčem v
          občini Cerknica, Loška Dolina ali Bloke.
        </p>
      </section>

      <section className="surface-card rounded-[18px] border border-border p-6 sm:p-7">
        <h2 className="font-heading text-xl font-semibold text-foreground">
          Šola oziroma fakulteta
        </h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <Field label="Sem" htmlFor="member_type">
            <NativeSelect
              id="member_type"
              name="member_type"
              defaultValue="student"
              className="h-12"
            >
              <option value="student">Študent</option>
              <option value="pupil">Dijak</option>
            </NativeSelect>
          </Field>
          <Field label="Letnik" htmlFor="study_year">
            <Input
              id="study_year"
              name="study_year"
              placeholder="npr. 2. letnik"
              className="h-12"
            />
          </Field>
          <Field
            label="Naziv šole ali fakultete"
            htmlFor="school"
            hint="Začni tipkati. Če šole ni na seznamu, jo preprosto vpiši."
            className="sm:col-span-2"
          >
            <SearchableSelect
              id="school"
              name="school"
              groups={schoolOptionGroups}
              placeholder="npr. Postojna, Bežigrad, FRI ..."
              required
            />
          </Field>
          <Field
            label="Ime programa"
            htmlFor="study_program"
            className="sm:col-span-2"
          >
            <Input id="study_program" name="study_program" className="h-12" />
          </Field>
        </div>
      </section>

      <section className="surface-card rounded-[18px] border border-border p-6 sm:p-7">
        <h2 className="font-heading text-xl font-semibold text-foreground">
          Potrdilo o vpisu
        </h2>
        <div className="mt-5 space-y-5">
          <Field
            label="Naloži potrdilo"
            htmlFor="proof"
            hint="PDF ali fotografija, do 5 MB. Če ga zdaj nimaš, ga lahko prineseš v času uradnih ur."
          >
            <Input
              id="proof"
              name="proof"
              type="file"
              accept="application/pdf,image/jpeg,image/png,image/heic"
              className="h-12 py-2.5"
            />
          </Field>
          <Field label="Sporočilo (neobvezno)" htmlFor="message">
            <Textarea
              id="message"
              name="message"
              rows={4}
              placeholder="Kaj bi rad počel v klubu?"
              className="min-h-28"
            />
          </Field>
        </div>
      </section>

      {state.error ? (
        <div
          aria-live="polite"
          className="rounded-xl border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {state.error}
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button
          type="submit"
          size="lg"
          disabled={pending}
          className="h-12 px-7 text-base font-semibold"
        >
          {pending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Oddajam ...
            </>
          ) : (
            <>
              <Send className="size-4" />
              Oddaj prijavo
            </>
          )}
        </Button>
        <p className="text-xs leading-5 text-muted-foreground">
          Z oddajo dovoliš {club.shortName}, da tvoje podatke obdeluje za namen
          vodenja članstva.
        </p>
      </div>
    </form>
  );
}
