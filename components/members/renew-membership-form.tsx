"use client";

import { useActionState } from "react";
import { ArrowRight, CircleCheck } from "lucide-react";

import { renewMembershipAction } from "@/app/actions/members";
import { SearchableSelect } from "@/components/forms/searchable-select";
import { SubmitButton } from "@/components/forms/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { schoolOptionGroups } from "@/lib/constants";
import { formatMembershipYear, type MissingMemberField } from "@/lib/membership";
import type { ActionState, Member } from "@/types/app";

const initialState: ActionState = {};

const fieldClass = "h-12";
const sectionClass = "surface-muted rounded-[18px] p-6 sm:p-8";

/**
 * Izriše eno manjkajoče polje.
 *
 * Polja so namenoma brez "required": podaljšanje se zgodi za pultom in ga
 * manjkajoč podatek ne sme ustaviti. Kar član prinese, se vpiše zdaj, ostalo
 * ostane na seznamu nepopolnih.
 */
function MissingFieldInput({ field }: { field: MissingMemberField }) {
  if (field.name === "faculty") {
    return (
      <SearchableSelect
        id={field.name}
        name={field.name}
        groups={schoolOptionGroups}
        placeholder="Začni tipkati - npr. Postojna, Bežigrad, FRI ..."
      />
    );
  }

  const shared = { id: field.name, name: field.name, className: fieldClass };

  switch (field.name) {
    case "emso":
      return (
        <Input
          {...shared}
          inputMode="numeric"
          maxLength={13}
          pattern="[0-9]{13}"
          placeholder="13 števk"
        />
      );
    case "birth_date":
    case "joined_at":
      return <Input {...shared} type="date" />;
    case "email":
      return <Input {...shared} type="email" placeholder="ime.priimek@email.si" />;
    case "phone":
      return <Input {...shared} type="tel" placeholder="031 123 456" />;
    case "postal_code":
      return <Input {...shared} inputMode="numeric" placeholder="1380" />;
    case "city":
      return <Input {...shared} placeholder="Cerknica" />;
    default:
      return <Input {...shared} placeholder="Cesta 1" />;
  }
}

export function RenewMembershipForm({
  member,
  missingFields,
  targetYear,
  returnTo = "/members",
}: {
  member: Member;
  missingFields: MissingMemberField[];
  targetYear: number;
  returnTo?: string;
}) {
  const [state, formAction] = useActionState(renewMembershipAction, initialState);
  const currentLabel = member.membership_year
    ? formatMembershipYear(member.membership_year)
    : "Brez leta članstva";

  return (
    <form action={formAction} className="space-y-8">
      <input type="hidden" name="id" value={member.id} />
      <input type="hidden" name="membership_year" value={targetYear} />
      <input type="hidden" name="return_to" value={returnTo} />

      <div className={sectionClass}>
        <h2 className="font-heading text-2xl font-semibold text-foreground">
          Novo leto članstva
        </h2>
        <div className="mt-5 flex flex-wrap items-center gap-4">
          <span className="rounded-xl border border-border bg-card px-4 py-3 text-base text-muted-foreground tabular-nums">
            {currentLabel}
          </span>
          <ArrowRight className="size-5 text-muted-foreground" aria-hidden="true" />
          <span className="rounded-xl bg-primary px-4 py-3 text-base font-semibold text-primary-foreground tabular-nums">
            {formatMembershipYear(targetYear)}
          </span>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          Status se ob podaljšanju nastavi na <strong>Aktiven</strong>. Datum
          včlanitve ostane tak, kot je - ta pove, kdaj je član prvič pristopil.
        </p>
      </div>

      {missingFields.length > 0 ? (
        <div className={sectionClass}>
          <div className="mb-5">
            <h2 className="font-heading text-2xl font-semibold text-foreground">
              Dopolni manjkajoče podatke
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Pri tem članu je {missingFields.length} praznih polj. Vpiši, kar
              član prinese s sabo; ostalo lahko ostane prazno in počaka na
              naslednjič.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {missingFields.map((field) => (
              <div
                key={field.name}
                className={
                  field.name === "faculty" || field.name === "address"
                    ? "space-y-2 md:col-span-2"
                    : "space-y-2"
                }
              >
                <Label htmlFor={field.name}>{field.label}</Label>
                <MissingFieldInput field={field} />
                {field.hint ? (
                  <p className="text-xs text-muted-foreground">{field.hint}</p>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className={sectionClass}>
          <div className="flex items-start gap-3">
            <CircleCheck className="mt-0.5 size-5 shrink-0 text-success" aria-hidden="true" />
            <div>
              <h2 className="font-heading text-2xl font-semibold text-foreground">
                Podatki so popolni
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Pri tem članu ni praznih polj - manjka samo podaljšanje za novo
                šolsko leto.
              </p>
            </div>
          </div>
        </div>
      )}

      {state.error ? (
        <div className="rounded-xl border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {state.error}
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SubmitButton
          type="submit"
          pendingLabel="Podaljšujem ..."
          className="h-12 rounded-full px-6 text-base font-semibold"
        >
          Podaljšaj članstvo za {formatMembershipYear(targetYear)}
        </SubmitButton>
      </div>
    </form>
  );
}
