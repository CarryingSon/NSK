import Link from "next/link";
import { format } from "date-fns";
import {
  Calendar,
  CheckCircle,
  History,
  Mail,
  Users,
  XCircle,
} from "lucide-react";

import { DeleteEmailCampaignButton } from "@/components/notifications/delete-email-campaign-button";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { getEmailCampaigns } from "@/lib/data";
import { notificationAudienceLabels } from "@/lib/constants";
import type { EmailLogMetadata } from "@/types/app";
import { cn } from "@/lib/utils";

export default async function NotificationHistoryPage() {
  const campaigns = await getEmailCampaigns();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Zgodovina obvestil"
        description="Pregled vseh poslanih obvestil članom, združenih po kampanjah kot v Kurniku."
        action={
          <Link
            href="/notifications"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "h-12 rounded-full px-6 text-base font-semibold",
            )}
          >
            Nazaj na obveščanje
          </Link>
        }
      />

      {campaigns.length === 0 ? (
        <EmptyState
          icon={History}
          title="Ni poslanih obvestil"
          description="Ko pošlješ prvo obvestilo, se bo tukaj prikazala zgodovina kampanj in uspešnost dostave."
        />
      ) : (
        <div className="grid gap-5">
          {campaigns.map((campaign, index) => {
            let metadata: EmailLogMetadata | null = null;

            if (campaign.metadata) {
              try {
                metadata = JSON.parse(campaign.metadata) as EmailLogMetadata;
              } catch {
                metadata = null;
              }
            }

            const successRate =
              campaign.totalSent > 0
                ? Math.round((campaign.successCount / campaign.totalSent) * 100)
                : 0;

            return (
              <Card
                key={`${campaign.subject}-${campaign.sentAt}-${index}`}
                className="surface-card rounded-[18px] border border-border bg-card"
              >
                <CardHeader className="px-6 pt-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-2">
                      <CardTitle className="flex items-center gap-2 text-xl">
                        <Mail className="size-5 text-primary" />
                        {campaign.subject}
                      </CardTitle>
                      <CardDescription className="flex flex-wrap items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Calendar className="size-4" />
                          {format(new Date(campaign.sentAt), "dd.MM.yyyy 'ob' HH:mm")}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="size-4" />
                          {campaign.totalSent} prejemnikov
                        </span>
                        {metadata?.audience ? (
                          <span>{notificationAudienceLabels[metadata.audience]}</span>
                        ) : null}
                      </CardDescription>
                    </div>

                    <div className="flex items-center gap-2 self-start">
                      <Badge
                        variant={
                          successRate === 100
                            ? "default"
                            : successRate > 0
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {successRate}% uspešnih
                      </Badge>
                      <DeleteEmailCampaignButton
                        subject={campaign.subject}
                        sentAt={campaign.sentAt}
                        totalSent={campaign.totalSent}
                      />
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 px-6 pb-6">
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="size-4 text-success" />
                      <span>
                        <strong>{campaign.successCount}</strong> uspešno poslanih
                      </span>
                    </div>
                    {campaign.failedCount > 0 ? (
                      <div className="flex items-center gap-2 text-sm">
                        <XCircle className="size-4 text-destructive" />
                        <span>
                          <strong>{campaign.failedCount}</strong> neuspešnih
                        </span>
                      </div>
                    ) : null}
                  </div>

                  {campaign.failedRecipients.length > 0 ? (
                    <details className="rounded-[14px] border border-destructive/25 bg-destructive/10/70 px-4 py-3">
                      <summary className="cursor-pointer text-sm font-medium text-destructive">
                        Prikaži neuspešno poslane emaile ({campaign.failedCount})
                      </summary>
                      <div className="mt-3 space-y-3">
                        {campaign.failedRecipients.map((recipient) => (
                          <div
                            key={`${campaign.subject}-${recipient.email}`}
                            className="rounded-xl border border-destructive/25 bg-card px-3 py-2 text-sm"
                          >
                            <p className="font-medium text-foreground">{recipient.email}</p>
                            {recipient.error ? (
                              <p className="mt-1 text-xs text-muted-foreground">
                                {recipient.error}
                              </p>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    </details>
                  ) : null}

                  {metadata?.createdByEmail ? (
                    <p className="text-sm text-muted-foreground">
                      Poslal: {metadata.createdByEmail}
                    </p>
                  ) : null}

                  {campaign.body ? (
                    <details className="rounded-[14px] border border-border bg-card px-4 py-3">
                      <summary className="cursor-pointer text-sm font-medium text-foreground">
                        Prikaži vsebino sporočila
                      </summary>
                      <div
                        // Predogled e-pošte je namenoma bel "papir": vsebina sporočila nosi lastne
                        // barve in predpostavlja svetlo podlago, zato barve teme tu ne uporabimo.
                        className="mt-4 overflow-hidden rounded-[12px] border border-border bg-white p-4 text-[#1d1d1f]"
                        dangerouslySetInnerHTML={{ __html: campaign.body }}
                      />
                    </details>
                  ) : null}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
