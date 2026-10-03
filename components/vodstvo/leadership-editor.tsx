"use client";

import { useActionState, useState } from "react";
import { ArrowDown, ArrowUp, Loader2, Plus, Trash2 } from "lucide-react";

import { saveLeadershipAction } from "@/app/actions/leadership";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ActionState, LeadershipMember } from "@/types/app";
import type { LeadershipBody } from "@/types/database";

const initialState: ActionState = {};

type Person = {
  // Ključ za React; obstoječe osebe imajo še id iz baze.
  key: string;
  id?: string;
  body: LeadershipBody;
  name: string;
  role: string;
  email: string;
};

const bodies: { body: LeadershipBody; title: string; hint: string }[] = [
  {
    body: "upravni",
    title: "Upravni odbor",
    hint: "Prva oseba s funkcijo predsednik_ca se pokaže tudi na strani Kontakt.",
  },
  {
    body: "nadzorni",
    title: "Nadzorni odbor",
    hint: "Funkcija ni obvezna - na strani se pokaže le, če je vpisana.",
  },
];

function toPerson(member: LeadershipMember): Person {
  return {
    key: member.id,
    id: member.id,
    body: member.body,
    name: member.name,
    role: member.role ?? "",
    email: member.email ?? "",
  };
}

export function LeadershipEditor({ members }: { members: LeadershipMember[] }) {
  const [state, formAction, pending] = useActionState(saveLeadershipAction, initialState);
  const [people, setPeople] = useState<Person[]>(() => members.map(toPerson));

  function update(key: string, field: "name" | "role" | "email", value: string) {
    setPeople((list) =>
      list.map((person) => (person.key === key ? { ...person, [field]: value } : person)),
    );
  }

  function remove(key: string) {
    setPeople((list) => list.filter((person) => person.key !== key));
  }

  function add(body: LeadershipBody) {
    setPeople((list) => [
      ...list,
      { key: crypto.randomUUID(), body, name: "", role: "", email: "" },
    ]);
  }

  // Premakne osebo gor ali dol znotraj njenega odbora.
  function move(key: string, direction: -1 | 1) {
    setPeople((list) => {
      const person = list.find((item) => item.key === key);
      if (!person) return list;

      const group = list.filter((item) => item.body === person.body);
      const index = group.indexOf(person);
      const target = group[index + direction];
      if (!target) return list;

      const next = [...list];
      const a = next.indexOf(person);
      const b = next.indexOf(target);
      [next[a], next[b]] = [next[b], next[a]];
      return next;
    });
  }

  const payload = JSON.stringify(
    people.map(({ id, body, name, role, email }) => ({ id, body, name, role, email })),
  );

  return (
    <form action={formAction} className="space-y-8">
      <input type="hidden" name="people" value={payload} />

      {bodies.map(({ body, title, hint }) => {
        const group = people.filter((person) => person.body === body);

        return (
          <section key={body} className="surface-muted rounded-[18px] p-6 sm:p-8">
            <h2 className="font-heading text-2xl font-semibold text-foreground">{title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{hint}</p>

            <div className="mt-5 space-y-3">
              {group.length === 0 ? (
                <p className="text-sm text-muted-foreground">V odboru ni nikogar.</p>
              ) : null}

              {group.map((person, index) => (
                <div
                  key={person.key}
                  className="grid gap-3 rounded-[14px] border border-border bg-card p-4 md:grid-cols-[1fr_1fr_1fr_auto] md:items-center"
                >
                  <Input
                    aria-label="Funkcija"
                    placeholder="Funkcija, npr. Tajnica"
                    value={person.role}
                    onChange={(event) => update(person.key, "role", event.target.value)}
                    className="h-11"
                  />
                  <Input
                    aria-label="Ime in priimek"
                    placeholder="Ime in priimek"
                    value={person.name}
                    required
                    onChange={(event) => update(person.key, "name", event.target.value)}
                    className="h-11"
                  />
                  <Input
                    aria-label="E-naslov"
                    type="email"
                    placeholder="E-naslov (neobvezno)"
                    value={person.email}
                    onChange={(event) => update(person.key, "email", event.target.value)}
                    className="h-11"
                  />
                  <div className="flex gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      title="Premakni gor"
                      disabled={index === 0}
                      onClick={() => move(person.key, -1)}
                    >
                      <ArrowUp className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      title="Premakni dol"
                      disabled={index === group.length - 1}
                      onClick={() => move(person.key, 1)}
                    >
                      <ArrowDown className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      title="Odstrani"
                      className="text-destructive"
                      onClick={() => remove(person.key)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <Button
              type="button"
              variant="outline"
              className="mt-4"
              onClick={() => add(body)}
            >
              <Plus className="size-4" />
              Dodaj osebo
            </Button>
          </section>
        );
      })}

      {state.error ? (
        <div
          aria-live="polite"
          className="rounded-xl border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {state.error}
        </div>
      ) : null}
      {state.success ? (
        <div
          aria-live="polite"
          className="rounded-xl border border-success/25 bg-success/10 px-4 py-3 text-sm text-success"
        >
          {state.success}
        </div>
      ) : null}

      <Button
        type="submit"
        size="lg"
        disabled={pending}
        className="h-12 px-7 text-base font-semibold"
      >
        {pending ? <Loader2 className="size-4 animate-spin" /> : null}
        Shrani vodstvo
      </Button>
    </form>
  );
}
