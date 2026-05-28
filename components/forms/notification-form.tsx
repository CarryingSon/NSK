"use client";

import { useActionState, useEffect, useRef } from "react";
import { Bell, Mail, Settings2 } from "lucide-react";

import { sendNotificationAction } from "@/app/actions/notifications";
import { SubmitButton } from "@/components/forms/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import type { ActionState, NotificationAudienceCount } from "@/types/app";

const initialState: ActionState = {};

export function NotificationForm({
  audiences,
  emailConfigured,
}: {
  audiences: NotificationAudienceCount[];
  emailConfigured: boolean;
}) {
  const [state, formAction] = useActionState(sendNotificationAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  return (
    <form ref={formRef} action={formAction} className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {audiences.map((audience) => (
          <div
            key={audience.value}
            className="rounded-[1.5rem] border border-white/70 bg-white/70 px-4 py-3"
          >
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              {audience.label}
            </p>
            <p className="mt-2 font-heading text-2xl font-semibold text-foreground">
              {audience.count}
            </p>
          </div>
        ))}
      </div>

      {!emailConfigured ? (
        <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
          <div className="flex items-start gap-3">
            <Settings2 className="mt-0.5 size-4 shrink-0" />
            <div>
              <p className="font-semibold">Email povezava še ni nastavljena</p>
              <p className="mt-1">
                Dodaj `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` in `SMTP_FROM`
                v `.env.local`, nato ponovno zaženi aplikacijo.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      <div className="rounded-[2rem] border border-white/70 bg-white/72 p-5">
        <div className="flex items-start gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/12 text-primary">
            <Bell className="size-5" />
          </div>
          <div>
            <h2 className="font-heading text-2xl font-semibold text-foreground">
              Pošlji obvestilo članom
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Tok pošiljanja in zgodovina sledita logiki iz Kurnika: vsak email se
              zabeleži posebej, zgodovina pa jih združi v eno kampanjo.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-5">
          <div className="space-y-2">
            <Label htmlFor="audience">Skupina prejemnikov</Label>
            <NativeSelect id="audience" name="audience" defaultValue="active">
              {audiences.map((audience) => (
                <option key={audience.value} value={audience.value}>
                  {audience.label} ({audience.count})
                </option>
              ))}
            </NativeSelect>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Zadeva</Label>
            <Input
              id="subject"
              name="subject"
              required
              placeholder="Npr. Pomembno obvestilo za člane"
              className="h-11 rounded-2xl bg-white/75 px-4"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="body">Vsebina sporočila</Label>
            <Textarea
              id="body"
              name="body"
              required
              placeholder="Napiši obvestilo. Odstavki in prelomi vrstic bodo ohranjeni tudi v emailu."
              className="min-h-48 rounded-[1.5rem] bg-white/75 px-4 py-3"
            />
          </div>
        </div>

        {state.error ? (
          <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {state.error}
          </div>
        ) : null}

        {state.success ? (
          <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {state.success}
          </div>
        ) : null}

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <SubmitButton
            type="submit"
            disabled={!emailConfigured}
            pendingLabel="Pošiljam ..."
            className="h-12 rounded-2xl px-6 text-base font-semibold shadow-lg shadow-primary/20"
          >
            <Mail className="size-4" />
            Pošlji obvestilo
          </SubmitButton>
        </div>
      </div>
    </form>
  );
}
