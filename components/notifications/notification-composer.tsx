"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import {
  CheckCircle2,
  FlaskConical,
  Send,
  Settings2,
  TriangleAlert,
  Users,
} from "lucide-react";

import {
  createCampaignAction,
  sendTestEmailAction,
} from "@/app/actions/notifications";
import { RichTextEditor } from "@/components/notifications/rich-text-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { campaignTypeOptions, defaultCampaignDailyLimit } from "@/lib/constants";
import type {
  ActionState,
  NotificationAudience,
  NotificationAudienceStats,
} from "@/types/app";

const initialState: ActionState = {};

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="surface-card rounded-[18px] border border-border p-6 sm:p-7">
      <h2 className="font-heading text-2xl font-semibold text-foreground">
        {title}
      </h2>
      <div className="mt-6 space-y-5">{children}</div>
    </section>
  );
}

function Hint({ children }: { children: React.ReactNode }) {
  return <p className="text-xs text-muted-foreground">{children}</p>;
}

export function NotificationComposer({
  stats,
  emailConfigured,
  testEmail,
}: {
  stats: NotificationAudienceStats;
  emailConfigured: boolean;
  testEmail: string;
}) {
  // Akciji kličemo sami, namesto prek useActionState: po uspešni uvrstitvi
  // moramo počistiti obrazec, to pa mora biti odziv na dogodek in ne stranski
  // učinek v useEffect.
  const [createState, setCreateState] = useState<ActionState>(initialState);
  const [testState, setTestState] = useState<ActionState>(initialState);
  const [creating, startCreate] = useTransition();
  const [testing, startTest] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const [audience, setAudience] = useState<NotificationAudience>("all");
  // Urejevalnik piše v DOM, zato ga form.reset() ne izprazni - po uspešni
  // uvrstitvi ga zato ponovno vgradimo s svežim ključem.
  const [editorKey, setEditorKey] = useState(0);

  function createCampaign(formData: FormData) {
    startCreate(async () => {
      setTestState(initialState);
      const result = await createCampaignAction(initialState, formData);
      setCreateState(result);

      if (result.success) {
        formRef.current?.reset();
        setAudience("all");
        setEditorKey((current) => current + 1);
      }
    });
  }

  function sendTest(formData: FormData) {
    startTest(async () => {
      setCreateState(initialState);
      setTestState(await sendTestEmailAction(initialState, formData));
    });
  }

  const selected = useMemo(
    () => stats.options.find((option) => option.value === audience),
    [stats.options, audience],
  );

  // Zadnje sporočilo obeh akcij; test in ustvarjanje si delita isto vrstico,
  // ker se nikoli ne izvedeta hkrati.
  const feedback = createState.error
    ? { tone: "error" as const, text: createState.error }
    : testState.error
      ? { tone: "error" as const, text: testState.error }
      : createState.success
        ? { tone: "success" as const, text: createState.success }
        : testState.success
          ? { tone: "success" as const, text: testState.success }
          : null;

  const pending = creating || testing;

  return (
    <form ref={formRef} action={createCampaign} className="space-y-6">
      {!emailConfigured ? (
        <div className="rounded-[18px] border border-warning/25 bg-warning/10 px-5 py-4 text-sm text-warning">
          <div className="flex items-start gap-3">
            <Settings2 className="mt-0.5 size-4 shrink-0" />
            <div>
              <p className="font-semibold">Email povezava še ni nastavljena</p>
              <p className="mt-1">
                Dodaj SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS in SMTP_FROM v
                .env.local, nato ponovno zaženi aplikacijo. Obvestilo lahko
                pripraviš in uvrstiš v vrsto tudi brez tega, poslati pa ga ne bo
                mogoče.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      <Section title="Naslov in podnaslov">
        <div className="space-y-2">
          <Label htmlFor="title">Naslov obvestila</Label>
          <Input
            id="title"
            name="title"
            required
            maxLength={150}
            placeholder="Vnesite naslov obvestila"
            className="h-12"
          />
          <Hint>Glavni naslov, ki bo prikazan v emailu in v zadevi sporočila.</Hint>
        </div>

        <div className="space-y-2">
          <Label htmlFor="subtitle">Podnaslov pod logotipom</Label>
          <Input
            id="subtitle"
            name="subtitle"
            maxLength={120}
            defaultValue="Pozor člani NŠK-ja!"
            placeholder="Pozor člani NŠK-ja!"
            className="h-12"
          />
          <Hint>Besedilo na oranžni glavi pod imenom kluba.</Hint>
        </div>
      </Section>

      <Section title="Vsebina obvestila">
        <div className="space-y-2">
          <RichTextEditor key={editorKey} name="content" />
          <Hint>Besedilo, slike in povezave, ki bodo prikazane v emailu.</Hint>
        </div>
      </Section>

      <Section title="CTA gumb (neobvezno)">
        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="cta_label">Besedilo gumba</Label>
            <Input
              id="cta_label"
              name="cta_label"
              maxLength={60}
              placeholder="npr. Prijavi se na dogodek"
              className="h-12"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cta_url">URL gumba</Label>
            <Input
              id="cta_url"
              name="cta_url"
              type="url"
              placeholder="npr. https://..."
              className="h-12"
            />
          </div>
        </div>
        <Hint>Če pustiš prazno, gumb ne bo prikazan.</Hint>
      </Section>

      <Section title="Nastavitve pošiljanja">
        <div className="space-y-2">
          <Label htmlFor="campaign_type">Tip obvestila</Label>
          <NativeSelect
            id="campaign_type"
            name="campaign_type"
            defaultValue="obvestilo"
            className="h-12"
          >
            {campaignTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </NativeSelect>
        </div>

        <div className="space-y-2">
          <Label htmlFor="audience">Občinstvo</Label>
          <NativeSelect
            id="audience"
            name="audience"
            value={audience}
            onChange={(event) =>
              setAudience(event.target.value as NotificationAudience)
            }
            className="h-12"
          >
            {stats.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label} ({option.count})
              </option>
            ))}
          </NativeSelect>

          <div className="rounded-[14px] border border-border bg-card px-4 py-3.5">
            <div className="flex items-start gap-3">
              <Users className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
              <div>
                <p className="font-heading text-[1.0625rem] font-semibold text-foreground">
                  {selected?.count ?? 0} prejemnikov
                </p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  Študenti: {stats.students} &middot; Dijaki: {stats.pupils}{" "}
                  &middot; Neopredeljeni: {stats.unknown} &middot; Skupaj z
                  e-pošto: {stats.totalWithEmail}
                </p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  {selected?.description}
                </p>
              </div>
            </div>
          </div>

          {stats.unknown > 0 &&
          (audience === "students" || audience === "pupils") ? (
            <div className="flex items-start gap-2 rounded-[14px] border border-border bg-muted/50 px-4 py-3 text-xs leading-5 text-muted-foreground">
              <TriangleAlert className="mt-0.5 size-4 shrink-0" />
              <span>
                Skupina se prebere iz polja &raquo;šola oziroma fakulteta&laquo;.
                {stats.unknown} članov ima vpisano šolo, ki je ni bilo mogoče
                uvrstiti - ti ostanejo dosegljivi prek občinstva &raquo;vsi
                člani&laquo;.
              </span>
            </div>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="daily_limit">
            Dnevna omejitev pošiljanja (max {stats.dailyLimit})
          </Label>
          <Input
            id="daily_limit"
            name="daily_limit"
            type="number"
            min={1}
            max={stats.dailyLimit}
            defaultValue={defaultCampaignDailyLimit}
            className="h-12"
          />
          <Hint>
            Gmail omejitev: {stats.dailyLimit} sporočil na dan. Danes je poslanih{" "}
            {stats.sentToday}, na voljo je še {stats.remainingToday}.
          </Hint>
        </div>

        {feedback ? (
          <div
            aria-live="polite"
            className={
              feedback.tone === "error"
                ? "rounded-xl border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm text-destructive"
                : "flex items-start gap-2 rounded-xl border border-success/25 bg-success/10 px-4 py-3 text-sm text-success"
            }
          >
            {feedback.tone === "success" ? (
              <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
            ) : null}
            <span>{feedback.text}</span>
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <input type="hidden" name="test_email" value={testEmail} />
          <Button
            type="submit"
            variant="secondary"
            size="lg"
            // Isti obrazec, druga akcija: test ne ustvari kampanje.
            formAction={sendTest}
            disabled={pending || !emailConfigured || !testEmail}
            className="h-12 px-6 text-base font-semibold"
          >
            <FlaskConical className="size-4" />
            {testing ? "Pošiljam test ..." : "Pošlji test meni"}
          </Button>

          <Button
            type="submit"
            size="lg"
            disabled={pending}
            className="h-12 px-6 text-base font-semibold"
          >
            <Send className="size-4" />
            {creating ? "Uvrščam ..." : "Ustvari in uvrsti v čakalno vrsto"}
          </Button>
        </div>

        <Hint>
          {testEmail
            ? `Test gre na ${testEmail} in se ne zapiše v zgodovino.`
            : "Testno sporočilo ni na voljo, ker prijavljeni račun nima e-poštnega naslova."}{" "}
          Pošiljanje članom se začne v zgodovini obvestil.
        </Hint>
      </Section>
    </form>
  );
}
