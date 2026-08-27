import Link from "next/link";
import {
  CheckCircle,
  History,
  Mail,
  Pause,
  Play,
  RotateCcw,
  Users,
  XCircle,
} from "lucide-react";

import {
  requeueFailedAction,
  setCampaignPausedAction,
} from "@/app/actions/notifications";
import { CampaignDispatcher } from "@/components/notifications/campaign-dispatcher";
import { DeleteCampaignButton } from "@/components/notifications/delete-campaign-button";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  campaignStatusLabels,
  campaignTypeLabels,
  notificationAudienceLabels,
} from "@/lib/constants";
import { getCampaignFailureList, getEmailCampaigns } from "@/lib/data";
import { formatDateTime } from "@/lib/format";
import { isEmailConfigured } from "@/lib/supabase/env";
import { cn } from "@/lib/utils";
import type { CampaignFailure } from "@/types/app";

export default async function NotificationHistoryPage() {
  const campaigns = await getEmailCampaigns();
  const emailConfigured = isEmailConfigured();

  // Neuspele naslove naložimo samo za kampanje, ki jih sploh imajo.
  const failuresByCampaign = new Map<string, CampaignFailure[]>(
    await Promise.all(
      campaigns
        .filter((campaign) => campaign.failedCount > 0)
        .map(
          async (campaign) =>
            [
              campaign.id,
              await getCampaignFailureList(campaign.id),
            ] as const,
        ),
    ),
  );

  return (
    <div className="space-y-8">
      <PageHeader
        title="Zgodovina obvestil"
        description="Vsako obvestilo s svojo čakalno vrsto: koliko je poslanega, kaj še čaka in kje je pošiljanje spodletelo."
        action={
          <Link
            href="/notifications"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "h-12 rounded-full px-6 text-base font-semibold",
            )}
          >
            Novo obvestilo
          </Link>
        }
      />

      {campaigns.length === 0 ? (
        <EmptyState
          icon={History}
          title="Ni pripravljenih obvestil"
          description="Ko sestaviš prvo obvestilo in ga uvrstiš v čakalno vrsto, se bo tukaj prikazal potek pošiljanja."
        />
      ) : (
        <div className="grid gap-5">
          {campaigns.map((campaign) => {
            const total = campaign.total_recipients;
            const processed = campaign.sentCount + campaign.failedCount;
            const successRate =
              processed > 0
                ? Math.round((campaign.sentCount / processed) * 100)
                : 0;
            const failures = failuresByCampaign.get(campaign.id) ?? [];
            const paused = campaign.status === "paused";

            return (
              <article
                key={campaign.id}
                className="surface-card space-y-5 rounded-[18px] border border-border p-6"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-2">
                    <h2 className="flex items-center gap-2 font-heading text-xl font-semibold text-foreground">
                      <Mail className="size-5 shrink-0 text-primary" />
                      {campaign.title}
                    </h2>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      <span>{formatDateTime(campaign.created_at)}</span>
                      <span className="flex items-center gap-1">
                        <Users className="size-4" />
                        {total} prejemnikov
                      </span>
                      <span>
                        {notificationAudienceLabels[campaign.audience]}
                      </span>
                      <span>{campaignTypeLabels[campaign.campaign_type]}</span>
                      {campaign.created_by ? (
                        <span>Pripravil: {campaign.created_by}</span>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start">
                    <Badge
                      variant={
                        campaign.status === "sent"
                          ? "default"
                          : paused
                            ? "outline"
                            : "secondary"
                      }
                    >
                      {campaignStatusLabels[campaign.status]}
                    </Badge>
                    <DeleteCampaignButton
                      campaignId={campaign.id}
                      title={campaign.title}
                      totalRecipients={total}
                      pendingCount={campaign.pendingCount}
                    />
                  </div>
                </div>

                <CampaignDispatcher
                  campaignId={campaign.id}
                  total={total}
                  initialSent={campaign.sentCount}
                  initialFailed={campaign.failedCount}
                  initialPending={campaign.pendingCount}
                  disabled={!emailConfigured || paused}
                />

                <div className="flex flex-wrap items-center gap-4">
                  <span className="flex items-center gap-2 text-sm">
                    <CheckCircle className="size-4 text-success" />
                    {successRate}% uspešnih dostav
                  </span>

                  {campaign.pendingCount > 0 ? (
                    <form action={setCampaignPausedAction}>
                      <input
                        type="hidden"
                        name="campaign_id"
                        value={campaign.id}
                      />
                      <input
                        type="hidden"
                        name="paused"
                        value={paused ? "false" : "true"}
                      />
                      <Button type="submit" variant="ghost" size="sm">
                        {paused ? (
                          <>
                            <Play className="size-4" />
                            Nadaljuj
                          </>
                        ) : (
                          <>
                            <Pause className="size-4" />
                            Zaustavi
                          </>
                        )}
                      </Button>
                    </form>
                  ) : null}

                  {campaign.failedCount > 0 ? (
                    <form action={requeueFailedAction}>
                      <input
                        type="hidden"
                        name="campaign_id"
                        value={campaign.id}
                      />
                      <Button type="submit" variant="ghost" size="sm">
                        <RotateCcw className="size-4" />
                        Vrni {campaign.failedCount} neuspelih v vrsto
                      </Button>
                    </form>
                  ) : null}
                </div>

                {failures.length > 0 ? (
                  <details className="rounded-[14px] border border-destructive/25 bg-destructive/10 px-4 py-3">
                    <summary className="cursor-pointer text-sm font-medium text-destructive">
                      Prikaži neuspešno poslane emaile ({campaign.failedCount})
                    </summary>
                    <div className="mt-3 space-y-2">
                      {failures.map((failure) => (
                        <div
                          key={`${campaign.id}-${failure.email}`}
                          className="rounded-xl border border-destructive/25 bg-card px-3 py-2 text-sm"
                        >
                          <p className="font-medium text-foreground">
                            {failure.name || failure.email}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {failure.email}
                          </p>
                          {failure.error ? (
                            <p className="mt-1 flex items-start gap-1.5 text-xs text-destructive">
                              <XCircle className="mt-0.5 size-3.5 shrink-0" />
                              {failure.error}
                            </p>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </details>
                ) : null}

                <details className="rounded-[14px] border border-border bg-card px-4 py-3">
                  <summary className="cursor-pointer text-sm font-medium text-foreground">
                    Prikaži vsebino sporočila
                  </summary>
                  {/* Vsebina je očiščena že ob shranjevanju kampanje, tu jo samo
                      izrišemo na belem "papirju", ker predpostavlja svetlo podlago. */}
                  <div
                    className="email-preview mt-4 overflow-hidden rounded-[12px] border border-border bg-white p-5 text-[#1d1d1f]"
                    dangerouslySetInnerHTML={{ __html: campaign.content_html }}
                  />
                </details>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
