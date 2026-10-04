import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Paperclip } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { requireAdmin } from "@/lib/auth";
import { emailKindLabels } from "@/lib/constants";
import { getEmailLogEntry } from "@/lib/data";
import { buildCampaignEmailHtml } from "@/lib/email";
import { formatDateTime } from "@/lib/format";

function formatSize(bytes: number) {
  return bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1).replace(".", ",")} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export default async function EmailLogEntryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const result = await getEmailLogEntry(id);

  if (!result) {
    notFound();
  }

  const { entry, campaign } = result;

  // Obvestilo sestavimo znova, kot ga je dobil ta prejemnik (z njegovim
  // pozdravom). Povezave za odjavo v ogledu ni - ni namenjena kliku.
  const html =
    entry.html ??
    (campaign
      ? buildCampaignEmailHtml({
          title: campaign.title,
          subtitle: campaign.subtitle,
          contentHtml: campaign.content_html,
          ctaLabel: campaign.cta_label,
          ctaUrl: campaign.cta_url,
          campaignType: campaign.campaign_type,
          recipientName: entry.recipient_name,
        })
      : null);

  return (
    <div className="space-y-6">
      <Link
        href="/notifications/history?tab=dnevnik"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Nazaj na dnevnik
      </Link>

      <section className="surface-card space-y-4 rounded-[18px] border border-border p-6">
        <h1 className="font-heading text-2xl font-semibold text-foreground">{entry.subject}</h1>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{emailKindLabels[entry.kind] ?? entry.kind}</Badge>
          {entry.status === "sent" ? (
            <Badge className="bg-success/15 text-success">Poslano</Badge>
          ) : (
            <Badge className="bg-destructive/15 text-destructive">Neuspešno</Badge>
          )}
        </div>
        <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-[auto_1fr]">
          <dt className="text-muted-foreground">Prejemnik</dt>
          <dd>{entry.to_email}</dd>
          <dt className="text-muted-foreground">Čas</dt>
          <dd className="tabular-nums">{formatDateTime(entry.created_at)}</dd>
          {entry.campaign_id ? (
            <>
              <dt className="text-muted-foreground">Obvestilo</dt>
              <dd>
                <Link href="/notifications/history" className="text-primary hover:underline">
                  {campaign?.title ?? "Izbrisano obvestilo"}
                </Link>
              </dd>
            </>
          ) : null}
          {entry.member_id ? (
            <>
              <dt className="text-muted-foreground">Član</dt>
              <dd>
                <Link href={`/members/${entry.member_id}`} className="text-primary hover:underline">
                  Odpri profil
                </Link>
              </dd>
            </>
          ) : null}
          {entry.error ? (
            <>
              <dt className="text-muted-foreground">Napaka</dt>
              <dd className="text-destructive">{entry.error}</dd>
            </>
          ) : null}
          {entry.attachments.length > 0 ? (
            <>
              <dt className="text-muted-foreground">Priponke</dt>
              <dd className="space-y-1">
                {entry.attachments.map((attachment) => (
                  <p key={attachment.filename} className="flex items-center gap-1.5">
                    <Paperclip className="size-3.5 text-muted-foreground" />
                    {attachment.filename}
                    <span className="text-muted-foreground">· {formatSize(attachment.size)}</span>
                  </p>
                ))}
                <p className="text-xs text-muted-foreground">
                  Priponke se ne hranijo, le njihova imena.
                </p>
              </dd>
            </>
          ) : null}
        </dl>
      </section>

      <section className="surface-card overflow-hidden rounded-[18px] border border-border">
        <h2 className="border-b border-border px-6 py-4 font-heading text-lg font-semibold">
          Sporočilo, kot ga je videl prejemnik
        </h2>
        {html ? (
          // sandbox brez dovoljenj: skripte, obrazci in navigacija iz sporočila
          // v Požiralniku ne smejo delovati.
          <iframe
            title="Vsebina sporočila"
            srcDoc={html}
            sandbox=""
            className="h-[80vh] w-full bg-white"
          />
        ) : (
          <p className="px-6 py-8 text-sm text-muted-foreground">
            Vsebina ni na voljo - obvestilo je bilo izbrisano.
          </p>
        )}
      </section>

      {entry.text_body ? (
        <details className="surface-card rounded-[18px] border border-border px-6 py-4">
          <summary className="cursor-pointer text-sm font-medium">Besedilna različica</summary>
          <pre className="mt-4 text-sm leading-6 whitespace-pre-wrap text-muted-foreground">
            {entry.text_body}
          </pre>
        </details>
      ) : null}
    </div>
  );
}
