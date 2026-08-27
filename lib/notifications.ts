import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import {
  campaignBatchSize,
  classifySchool,
  emailDailyLimit,
  notificationAudienceDescriptions,
  notificationAudienceLabels,
  notificationAudienceOrder,
} from "@/lib/constants";
import { buildCampaignEmailHtml, sendEmail } from "@/lib/email";
import { richTextToPlainText } from "@/lib/email-content";
import type {
  CampaignFailure,
  CampaignWithProgress,
  DispatchBatchResult,
  NotificationAudienceStats,
} from "@/types/app";
import type {
  CampaignType,
  Database,
  MemberSegment,
  NotificationAudience,
  QueueItemStatus,
} from "@/types/database";

type AppSupabaseClient = SupabaseClient<Database>;

interface AudienceMember {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  segment: MemberSegment;
  membership_status: string;
}

/**
 * Polnoč v Ljubljani, izražena kot trenutek v UTC. Strežniška funkcija teče v
 * UTC, dnevna kvota pošiljanja pa se mora obrniti ob domači polnoči, ne ob dveh
 * zjutraj.
 */
function startOfLocalDay(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Ljubljana",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(now);

  const value = (type: string) =>
    Number(parts.find((part) => part.type === type)?.value ?? "0");

  const wallClock = Date.UTC(
    value("year"),
    value("month") - 1,
    value("day"),
    value("hour") === 24 ? 0 : value("hour"),
    value("minute"),
    value("second"),
  );

  const offset = wallClock - now.getTime();
  const midnight = Date.UTC(value("year"), value("month") - 1, value("day"));

  return new Date(midnight - offset).toISOString();
}

// Vse člane z e-pošto potrebujemo tako za štetje kot za polnjenje čakalne vrste,
// zato jih naložimo enkrat in razvrstimo v pomnilniku. Skupine ni v bazi -
// izpeljemo jo iz naziva šole.
async function loadMembersWithEmail(supabase: AppSupabaseClient) {
  const { data, error } = await supabase
    .from("members")
    .select("id, first_name, last_name, email, faculty, membership_status")
    .not("email", "is", null)
    .order("last_name", { ascending: true })
    .order("first_name", { ascending: true });

  if (error) {
    throw error;
  }

  const seen = new Set<string>();
  const members: AudienceMember[] = [];

  for (const row of data ?? []) {
    const email = (row.email ?? "").trim();

    if (!email) {
      continue;
    }

    const key = email.toLowerCase();

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    members.push({
      id: row.id,
      first_name: row.first_name,
      last_name: row.last_name,
      email,
      segment: classifySchool(row.faculty),
      membership_status: row.membership_status,
    });
  }

  return members;
}

function matchesAudience(member: AudienceMember, audience: NotificationAudience) {
  switch (audience) {
    case "students":
      return member.segment === "student";
    case "pupils":
      return member.segment === "pupil";
    case "active":
      return member.membership_status === "active";
    case "inactive":
      return member.membership_status === "inactive";
    case "pending":
      return member.membership_status === "pending";
    case "all":
    default:
      return true;
  }
}

// Koliko sporočil je danes že odšlo - šteje se po vseh kampanjah skupaj, ker je
// omejitev vezana na poštni račun kluba, ne na posamezno obvestilo.
async function countSentToday(
  supabase: AppSupabaseClient,
  campaignId?: string,
) {
  let query = supabase
    .from("email_queue")
    .select("*", { count: "exact", head: true })
    .eq("status", "sent")
    .gte("sent_at", startOfLocalDay());

  if (campaignId) {
    query = query.eq("campaign_id", campaignId);
  }

  const { count, error } = await query;

  if (error) {
    throw error;
  }

  return count ?? 0;
}

export async function getAudienceStats(
  supabase: AppSupabaseClient,
): Promise<NotificationAudienceStats> {
  const [members, sentToday] = await Promise.all([
    loadMembersWithEmail(supabase),
    countSentToday(supabase),
  ]);

  const options = notificationAudienceOrder.map((value) => ({
    value,
    label: notificationAudienceLabels[value],
    description: notificationAudienceDescriptions[value],
    count: members.filter((member) => matchesAudience(member, value)).length,
  }));

  return {
    options,
    totalWithEmail: members.length,
    students: members.filter((member) => member.segment === "student").length,
    pupils: members.filter((member) => member.segment === "pupil").length,
    unknown: members.filter((member) => member.segment === "unknown").length,
    active: members.filter((member) => member.membership_status === "active")
      .length,
    inactive: members.filter(
      (member) => member.membership_status === "inactive",
    ).length,
    sentToday,
    remainingToday: Math.max(emailDailyLimit - sentToday, 0),
    dailyLimit: emailDailyLimit,
  };
}

export interface CreateCampaignInput {
  title: string;
  subtitle: string | null;
  contentHtml: string;
  ctaLabel: string | null;
  ctaUrl: string | null;
  campaignType: CampaignType;
  audience: NotificationAudience;
  dailyLimit: number;
  createdBy: string | null;
}

/**
 * Ustvari kampanjo in ji napolni čakalno vrsto. Prejemniki se posnamejo ob
 * uvrstitvi, ne ob pošiljanju - član, ki se včlani jutri, ne dobi včerajšnjega
 * obvestila, izbrisani član pa pošiljanja ne podre.
 */
export async function createCampaign(
  supabase: AppSupabaseClient,
  input: CreateCampaignInput,
) {
  const members = (await loadMembersWithEmail(supabase)).filter((member) =>
    matchesAudience(member, input.audience),
  );

  if (members.length === 0) {
    return { campaignId: null, recipients: 0 } as const;
  }

  const { data: campaign, error: campaignError } = await supabase
    .from("email_campaigns")
    .insert({
      title: input.title,
      subtitle: input.subtitle,
      content_html: input.contentHtml,
      cta_label: input.ctaLabel,
      cta_url: input.ctaUrl,
      campaign_type: input.campaignType,
      audience: input.audience,
      daily_limit: input.dailyLimit,
      status: "queued",
      total_recipients: members.length,
      created_by: input.createdBy,
    })
    .select("id")
    .single();

  if (campaignError || !campaign) {
    throw campaignError ?? new Error("Kampanje ni bilo mogoče ustvariti.");
  }

  const rows = members.map((member) => ({
    campaign_id: campaign.id,
    member_id: member.id,
    to_email: member.email,
    first_name: member.first_name,
    last_name: member.last_name,
    segment: member.segment,
  }));

  // Supabase ima omejitev velikosti zahteve, zato vrsto polnimo po delih.
  for (let index = 0; index < rows.length; index += 500) {
    const { error } = await supabase
      .from("email_queue")
      .insert(rows.slice(index, index + 500));

    if (error) {
      throw error;
    }
  }

  return { campaignId: campaign.id, recipients: members.length } as const;
}

/**
 * Pošlje eno serijo iz čakalne vrste. Klicatelj jo ponavlja, dokler ni
 * `done` ali dokler ni dosežena dnevna omejitev - tako ena zahteva nikoli ne
 * traja predolgo in napredek je viden sproti.
 */
export async function dispatchCampaignBatch(
  supabase: AppSupabaseClient,
  campaignId: string,
): Promise<DispatchBatchResult> {
  const { data: campaign, error: campaignError } = await supabase
    .from("email_campaigns")
    .select("*")
    .eq("id", campaignId)
    .single();

  if (campaignError || !campaign) {
    throw campaignError ?? new Error("Kampanja ne obstaja.");
  }

  if (campaign.status === "paused") {
    const pending = await countQueue(supabase, campaignId, "pending");

    return {
      sent: 0,
      failed: 0,
      pending,
      done: false,
      dailyLimitReached: false,
      message: "Pošiljanje je na pavzi.",
    };
  }

  const [sentTodayTotal, sentTodayCampaign] = await Promise.all([
    countSentToday(supabase),
    countSentToday(supabase, campaignId),
  ]);

  const allowance = Math.min(
    emailDailyLimit - sentTodayTotal,
    campaign.daily_limit - sentTodayCampaign,
  );

  if (allowance <= 0) {
    const pending = await countQueue(supabase, campaignId, "pending");

    return {
      sent: 0,
      failed: 0,
      pending,
      done: pending === 0,
      dailyLimitReached: true,
      message:
        "Dnevna omejitev je dosežena. Pošiljanje se nadaljuje jutri - kampanja ostane v čakalni vrsti.",
    };
  }

  await reclaimStalledItems(supabase, campaignId);

  const { data: batch, error: batchError } = await supabase
    .from("email_queue")
    .select("id, to_email, first_name, attempts")
    .eq("campaign_id", campaignId)
    .eq("status", "pending")
    .order("created_at", { ascending: true })
    .limit(Math.min(campaignBatchSize, allowance));

  if (batchError) {
    throw batchError;
  }

  if (!batch || batch.length === 0) {
    await markCampaignFinished(supabase, campaignId);

    return {
      sent: 0,
      failed: 0,
      pending: 0,
      done: true,
      dailyLimitReached: false,
      message: "Vsa sporočila iz te kampanje so že poslana.",
    };
  }

  if (campaign.status !== "sending") {
    await supabase
      .from("email_campaigns")
      .update({ status: "sending" })
      .eq("id", campaignId);
  }

  const plainText = richTextToPlainText(campaign.content_html);
  let sent = 0;
  let failed = 0;

  for (const item of batch) {
    // Vrstico prevzamemo s pogojno posodobitvijo: če jo je medtem pobral drug
    // zavihek, tu ne dobimo nič in sporočila ne pošljemo dvakrat.
    const { data: claimed, error: claimError } = await supabase
      .from("email_queue")
      .update({
        status: "sending",
        attempts: item.attempts + 1,
        claimed_at: new Date().toISOString(),
      })
      .eq("id", item.id)
      .eq("status", "pending")
      .select("id");

    if (claimError) {
      throw claimError;
    }

    if (!claimed || claimed.length === 0) {
      continue;
    }

    const html = buildCampaignEmailHtml({
      title: campaign.title,
      subtitle: campaign.subtitle,
      contentHtml: campaign.content_html,
      ctaLabel: campaign.cta_label,
      ctaUrl: campaign.cta_url,
      campaignType: campaign.campaign_type,
      recipientName: item.first_name,
    });

    const delivery = await sendEmail({
      to: item.to_email,
      subject: campaign.title,
      html,
      text: plainText,
    });

    if (delivery.success) {
      sent += 1;
    } else {
      failed += 1;
    }

    await supabase
      .from("email_queue")
      .update({
        status: delivery.success ? "sent" : "failed",
        error_message: delivery.success ? null : delivery.error,
        sent_at: delivery.success ? new Date().toISOString() : null,
        claimed_at: null,
      })
      .eq("id", item.id);
  }

  const pending = await countQueue(supabase, campaignId, "pending");

  if (pending === 0) {
    await markCampaignFinished(supabase, campaignId);
  }

  return {
    sent,
    failed,
    pending,
    done: pending === 0,
    dailyLimitReached: false,
    message:
      pending === 0
        ? "Kampanja je poslana."
        : `Poslano ${sent}, še ${pending} v vrsti.`,
  };
}

// Serija, ki se je ustavila sredi pošiljanja (zaprt zavihek, izpad funkcije),
// pusti vrstice v stanju "sending". Po petih minutah jih vrnemo v vrsto - toliko
// časa ena serija nikoli ne traja.
async function reclaimStalledItems(
  supabase: AppSupabaseClient,
  campaignId: string,
) {
  const cutoff = new Date(Date.now() - 5 * 60 * 1000).toISOString();

  await supabase
    .from("email_queue")
    .update({ status: "pending", claimed_at: null })
    .eq("campaign_id", campaignId)
    .eq("status", "sending")
    .lt("claimed_at", cutoff);
}

async function markCampaignFinished(
  supabase: AppSupabaseClient,
  campaignId: string,
) {
  await supabase
    .from("email_campaigns")
    .update({ status: "sent", completed_at: new Date().toISOString() })
    .eq("id", campaignId);
}

async function countQueue(
  supabase: AppSupabaseClient,
  campaignId: string,
  status: "pending" | "sent" | "failed",
) {
  // "sending" je le vmesno stanje enega prevzema, zato ga štejemo k čakajočim.
  const statuses: QueueItemStatus[] =
    status === "pending" ? ["pending", "sending"] : [status];

  const { count, error } = await supabase
    .from("email_queue")
    .select("*", { count: "exact", head: true })
    .eq("campaign_id", campaignId)
    .in("status", statuses);

  if (error) {
    throw error;
  }

  return count ?? 0;
}

export async function getCampaignsWithProgress(supabase: AppSupabaseClient) {
  const { data: campaigns, error } = await supabase
    .from("email_campaigns")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    throw error;
  }

  if (!campaigns || campaigns.length === 0) {
    return [] as CampaignWithProgress[];
  }

  // Namesto treh poizvedb na kampanjo naložimo stanja vseh vrstic naenkrat in
  // jih preštejemo v pomnilniku.
  const { data: queueRows, error: queueError } = await supabase
    .from("email_queue")
    .select("campaign_id, status")
    .in(
      "campaign_id",
      campaigns.map((campaign) => campaign.id),
    );

  if (queueError) {
    throw queueError;
  }

  const tally = new Map<string, { pending: number; sent: number; failed: number }>();

  for (const row of queueRows ?? []) {
    const entry = tally.get(row.campaign_id) ?? {
      pending: 0,
      sent: 0,
      failed: 0,
    };

    // Prevzete vrstice ("sending") so za pregled še vedno v vrsti.
    const bucket = row.status === "sending" ? "pending" : row.status;
    entry[bucket] += 1;
    tally.set(row.campaign_id, entry);
  }

  return campaigns.map((campaign) => {
    const entry = tally.get(campaign.id) ?? { pending: 0, sent: 0, failed: 0 };

    return {
      ...campaign,
      pendingCount: entry.pending,
      sentCount: entry.sent,
      failedCount: entry.failed,
    };
  }) as CampaignWithProgress[];
}

export async function getCampaignFailures(
  supabase: AppSupabaseClient,
  campaignId: string,
) {
  const { data, error } = await supabase
    .from("email_queue")
    .select("to_email, first_name, last_name, error_message")
    .eq("campaign_id", campaignId)
    .eq("status", "failed")
    .limit(200);

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => ({
    email: row.to_email,
    name: `${row.first_name ?? ""} ${row.last_name ?? ""}`.trim(),
    error: row.error_message,
  })) as CampaignFailure[];
}

// Neuspeli naslovi se pogosto pokvarijo zaradi trenutne napake pri ponudniku,
// zato jih je smiselno vrniti v vrsto brez ponovnega ustvarjanja kampanje.
export async function requeueFailed(
  supabase: AppSupabaseClient,
  campaignId: string,
) {
  const { error } = await supabase
    .from("email_queue")
    .update({ status: "pending", error_message: null, claimed_at: null })
    .eq("campaign_id", campaignId)
    .eq("status", "failed");

  if (error) {
    throw error;
  }

  await supabase
    .from("email_campaigns")
    .update({ status: "queued", completed_at: null })
    .eq("id", campaignId);
}
