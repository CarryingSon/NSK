import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { buildNotificationEmailHtml, sendEmail } from "@/lib/email";
import { notificationAudienceLabels } from "@/lib/constants";
import type {
  Database,
  EmailLogStatus,
} from "@/types/database";
import type {
  EmailCampaign,
  EmailLogMetadata,
  NotificationAudience,
  NotificationAudienceCount,
} from "@/types/app";

type AppSupabaseClient = SupabaseClient<Database>;

interface NotificationRecipient {
  email: string;
  first_name: string;
  last_name: string;
}

export async function getAudienceMembers(
  supabase: AppSupabaseClient,
  audience: NotificationAudience,
) {
  let query = supabase
    .from("members")
    .select("first_name, last_name, email, membership_status")
    .not("email", "is", null)
    .order("last_name", { ascending: true })
    .order("first_name", { ascending: true });

  if (audience === "active") {
    query = query.eq("membership_status", "active");
  }

  if (audience === "inactive") {
    query = query.eq("membership_status", "inactive");
  }

  if (audience === "pending") {
    query = query.eq("membership_status", "pending");
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  const rows = (data ?? []) as Array<{
    email: string | null;
    first_name: string;
    last_name: string;
  }>;
  const seenEmails = new Set<string>();

  return rows
    .filter((member) => Boolean(member.email))
    .map((member) => ({
      email: member.email ?? "",
      first_name: member.first_name,
      last_name: member.last_name,
    }))
    .filter((recipient) => {
      const normalizedEmail = recipient.email.toLowerCase();

      if (seenEmails.has(normalizedEmail)) {
        return false;
      }

      seenEmails.add(normalizedEmail);
      return true;
    }) as NotificationRecipient[];
}

export async function getNotificationAudienceCounts(supabase: AppSupabaseClient) {
  const audienceOrder: NotificationAudience[] = [
    "active",
    "all",
    "inactive",
    "pending",
  ];

  const [all, active, inactive, pending] = await Promise.all([
    supabase
      .from("members")
      .select("*", { count: "exact", head: true })
      .not("email", "is", null),
    supabase
      .from("members")
      .select("*", { count: "exact", head: true })
      .eq("membership_status", "active")
      .not("email", "is", null),
    supabase
      .from("members")
      .select("*", { count: "exact", head: true })
      .eq("membership_status", "inactive")
      .not("email", "is", null),
    supabase
      .from("members")
      .select("*", { count: "exact", head: true })
      .eq("membership_status", "pending")
      .not("email", "is", null),
  ]);

  const countsMap: Record<NotificationAudience, number> = {
    all: all.count ?? 0,
    active: active.count ?? 0,
    inactive: inactive.count ?? 0,
    pending: pending.count ?? 0,
  };

  return audienceOrder.map((value) => ({
    value,
    label: notificationAudienceLabels[value],
    count: countsMap[value],
  })) as NotificationAudienceCount[];
}

export async function deliverNotificationCampaign({
  supabase,
  audience,
  subject,
  body,
  createdByEmail,
}: {
  supabase: AppSupabaseClient;
  audience: NotificationAudience;
  subject: string;
  body: string;
  createdByEmail?: string | null;
}) {
  const recipients = await getAudienceMembers(supabase, audience);

  if (recipients.length === 0) {
    return {
      successCount: 0,
      failedCount: 0,
      totalCount: 0,
    };
  }

  const html = buildNotificationEmailHtml({ subject, body });
  const metadata: EmailLogMetadata = {
    audience,
    createdByEmail: createdByEmail ?? null,
  };

  const logRows: Database["public"]["Tables"]["email_logs"]["Insert"][] = [];

  for (const recipient of recipients) {
    const delivery = await sendEmail({
      to: recipient.email,
      subject,
      html,
      text: body,
    });

    const status = (delivery.success ? "sent" : "failed") as EmailLogStatus;

    logRows.push({
      to_email: recipient.email,
      subject,
      body: html,
      status,
      error_message: delivery.success ? null : delivery.error,
      metadata: JSON.stringify(metadata),
    });
  }

  const { error } = await supabase.from("email_logs").insert(logRows);

  if (error) {
    throw error;
  }

  const successCount = logRows.filter((log) => log.status === "sent").length;
  const failedCount = logRows.length - successCount;

  return {
    successCount,
    failedCount,
    totalCount: logRows.length,
  };
}

export function groupEmailLogsIntoCampaigns(
  logs: Database["public"]["Tables"]["email_logs"]["Row"][],
) {
  if (logs.length === 0) {
    return [] as EmailCampaign[];
  }

  const campaigns: Array<{
    subject: string;
    body: string | null;
    sentAt: string;
    logs: Database["public"]["Tables"]["email_logs"]["Row"][];
    metadata: string | null;
  }> = [];

  for (const log of logs) {
    const existingCampaign = campaigns.find(
      (campaign) =>
        campaign.subject === log.subject &&
        Math.abs(
          new Date(campaign.sentAt).getTime() - new Date(log.created_at).getTime(),
        ) < 60000,
    );

    if (existingCampaign) {
      existingCampaign.logs.push(log);
      continue;
    }

    campaigns.push({
      subject: log.subject,
      body: log.body,
      sentAt: log.created_at,
      logs: [log],
      metadata: log.metadata,
    });
  }

  return campaigns.slice(0, 50).map((campaign) => {
    const failedLogs = campaign.logs.filter((log) => log.status === "failed");

    return {
      subject: campaign.subject,
      body: campaign.body,
      sentAt: campaign.sentAt,
      totalSent: campaign.logs.length,
      successCount: campaign.logs.filter((log) => log.status === "sent").length,
      failedCount: failedLogs.length,
      metadata: campaign.metadata,
      failedRecipients: failedLogs.map((log) => ({
        email: log.to_email,
        error: log.error_message,
      })),
    };
  }) as EmailCampaign[];
}

export function getDeleteWindow(sentAt: string) {
  const sentDate = new Date(sentAt);

  return {
    startTime: new Date(sentDate.getTime() - 60000).toISOString(),
    endTime: new Date(sentDate.getTime() + 60000).toISOString(),
  };
}
