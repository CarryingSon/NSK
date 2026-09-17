"use client";

import { useActionState } from "react";
import { BellOff, CheckCircle2 } from "lucide-react";

import {
  resubscribeAction,
  unsubscribeAction,
} from "@/app/actions/unsubscribe";
import { SubmitButton } from "@/components/forms/submit-button";
import { club } from "@/lib/constants";
import type { ActionState } from "@/types/app";

const initialState: ActionState = {};

/**
 * Potrditev odjave.
 *
 * Odjavljen član dobi na isti strani pot nazaj - odjava s klikom po pomoti je
 * pogostejša od namerne, vračanje prek uradnih ur pa nesorazmerno.
 */
export function UnsubscribePanel({
  token,
  firstName,
  email,
  optedOut,
}: {
  token: string;
  firstName: string;
  email: string | null;
  optedOut: boolean;
}) {
  const [outState, unsubscribe] = useActionState(
    unsubscribeAction,
    initialState,
  );
  const [inState, resubscribe] = useActionState(
    resubscribeAction,
    initialState,
  );

  // Stanje iz baze velja le do prve akcije; po njej šteje izid akcije.
  const isOut = inState.success ? false : optedOut || Boolean(outState.success);
  const error = outState.error ?? inState.error;

  return (
    <section className="surface-card mt-8 rounded-[18px] border border-border p-7 text-center sm:p-9">
      <div
        className={`mx-auto flex size-14 items-center justify-center rounded-full ${
          isOut ? "bg-muted text-muted-foreground" : "bg-success/12 text-success"
        }`}
      >
        {isOut ? (
          <BellOff className="size-7" />
        ) : (
          <CheckCircle2 className="size-7" />
        )}
      </div>

      <h1 className="mt-5 font-heading text-2xl font-semibold text-foreground">
        {isOut ? "Odjavljen_a si" : `Živjo, ${firstName}`}
      </h1>

      <p className="mx-auto mt-3 max-w-md text-[0.9375rem] leading-6 text-muted-foreground">
        {isOut ? (
          <>
            Na {email ?? "ta naslov"} ti ne bomo več pošiljali obvestil o
            dogodkih in ugodnostih. <strong>Članstvo v {club.shortName}</strong>{" "}
            s tem ni spremenjeno - ostajaš član_ica.
          </>
        ) : (
          <>
            Tukaj se lahko odjaviš od obvestil o dogodkih in ugodnostih, ki jih
            pošiljamo na {email ?? "tvoj naslov"}. Odjava ne pomeni izpisa iz
            kluba - <strong>članstvo ostane nespremenjeno</strong>.
          </>
        )}
      </p>

      {error ? (
        <p
          aria-live="polite"
          className="mx-auto mt-5 max-w-md rounded-xl border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </p>
      ) : null}

      <form action={isOut ? resubscribe : unsubscribe} className="mt-7">
        <input type="hidden" name="token" value={token} />
        <SubmitButton
          type="submit"
          variant={isOut ? "default" : "destructive"}
          pendingLabel={isOut ? "Prijavljam ..." : "Odjavljam ..."}
          className="h-12 rounded-full px-7 text-base font-semibold"
        >
          {isOut ? "Želim spet prejemati obvestila" : "Odjavi me od obveščanja"}
        </SubmitButton>
      </form>
    </section>
  );
}
