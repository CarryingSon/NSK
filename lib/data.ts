import {
  formatMonthLabel,
  getMemberFullName,
  monthRange,
  parseMonthParam,
  startOfCurrentMonth,
  toMonthParam,
} from "@/lib/format";
import {
  emailDailyLimit,
  notificationAudienceDescriptions,
  notificationAudienceLabels,
  notificationAudienceOrder,
} from "@/lib/constants";
import {
  getAudienceStats,
  getCampaignFailures,
  getCampaignsWithProgress,
} from "@/lib/notifications";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  ApplicationCounts,
  ApplicationRow,
  CampaignFailure,
  CampaignWithProgress,
  DashboardOverview,
  Member,
  MemberFilters,
  MemberOption,
  MemberRegistrationHistoryItem,
  PrintOverview,
  PrintMemberRow,
  PrintMonthSummary,
  NotificationAudienceStats,
} from "@/types/app";
import type { ApplicationStatus } from "@/types/database";

async function getSupabaseOrNull() {
  if (!isSupabaseConfigured()) {
    return null;
  }

  return createSupabaseServerClient();
}

export async function getMembers(filters: MemberFilters = {}) {
  const supabase = await getSupabaseOrNull();

  if (!supabase) {
    return {
      members: [] as Member[],
      demoMode: true,
    };
  }

  try {
    let query = supabase
      .from("members")
      .select("*")
      .order("created_at", { ascending: false });

    if (filters.query?.trim()) {
      const term = filters.query.trim().replaceAll(",", " ");
      query = query.or(
        [
          `first_name.ilike.%${term}%`,
          `last_name.ilike.%${term}%`,
          `faculty.ilike.%${term}%`,
          `email.ilike.%${term}%`,
          `phone.ilike.%${term}%`,
        ].join(","),
      );
    }

    if (filters.status && filters.status !== "all") {
      query = query.eq("membership_status", filters.status);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return {
      members: (data ?? []) as Member[],
      demoMode: false,
    };
  } catch (error) {
    console.error("Napaka pri nalaganju članov", error);

    return {
      members: [] as Member[],
      demoMode: true,
    };
  }
}

export async function getMemberById(id: string) {
  const supabase = await getSupabaseOrNull();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("members")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Napaka pri nalaganju člana", error);
    return null;
  }

  return (data as Member | null) ?? null;
}

export async function getMemberRegistrationHistory(memberId: string) {
  const supabase = await getSupabaseOrNull();

  if (!supabase) {
    return [] as MemberRegistrationHistoryItem[];
  }

  const { data, error } = await supabase
    .from("event_registrations")
    .select(
      "id, status, registered_at, notes, events:event_id ( id, title, starts_at, location, status )",
    )
    .eq("member_id", memberId)
    .order("registered_at", { ascending: false });

  if (error) {
    console.error("Napaka pri nalaganju zgodovine prijav člana", error);
    return [] as MemberRegistrationHistoryItem[];
  }

  const historyRows = (data ?? []) as Array<{
    id: string;
    status: MemberRegistrationHistoryItem["status"];
    registered_at: string;
    notes: string | null;
    events: MemberRegistrationHistoryItem["event"];
  }>;

  return historyRows.map((item) => ({
    id: item.id,
    status: item.status,
    registered_at: item.registered_at,
    notes: item.notes,
    event: item.events
      ? {
          id: item.events.id,
          title: item.events.title,
          starts_at: item.events.starts_at,
          location: item.events.location,
          status: item.events.status,
        }
      : null,
  })) as MemberRegistrationHistoryItem[];
}

// Izbirnik potrebuje samo ime za prikaz in id za vrednost. Prej je šel skozi
// getMembers(), ki pobere vse stolpce vseh članov - za spustni seznam odveč.
export async function getMembersForSelect(): Promise<MemberOption[]> {
  const supabase = await getSupabaseOrNull();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("members")
    .select("id, first_name, last_name")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Napaka pri nalaganju članov za izbirnik", error);
    return [];
  }

  return (data ?? []) as MemberOption[];
}

// Brez Supabase povezave stran še vedno izriše obrazec, le brez števil.
function emptyAudienceStats(): NotificationAudienceStats {
  return {
    options: notificationAudienceOrder.map((value) => ({
      value,
      label: notificationAudienceLabels[value],
      description: notificationAudienceDescriptions[value],
      count: 0,
    })),
    totalWithEmail: 0,
    students: 0,
    pupils: 0,
    unknown: 0,
    active: 0,
    inactive: 0,
    sentToday: 0,
    remainingToday: emailDailyLimit,
    dailyLimit: emailDailyLimit,
  };
}

export async function getNotificationAudienceStats() {
  const supabase = await getSupabaseOrNull();

  if (!supabase) {
    return emptyAudienceStats();
  }

  try {
    return await getAudienceStats(supabase);
  } catch (error) {
    console.error("Napaka pri nalaganju občinstev za obveščanje", error);
    return emptyAudienceStats();
  }
}

export async function getEmailCampaigns() {
  const supabase = await getSupabaseOrNull();

  if (!supabase) {
    return [] as CampaignWithProgress[];
  }

  try {
    return await getCampaignsWithProgress(supabase);
  } catch (error) {
    console.error("Napaka pri nalaganju zgodovine obvestil", error);
    return [] as CampaignWithProgress[];
  }
}

export async function getCampaignFailureList(campaignId: string) {
  const supabase = await getSupabaseOrNull();

  if (!supabase) {
    return [] as CampaignFailure[];
  }

  try {
    return await getCampaignFailures(supabase, campaignId);
  } catch (error) {
    console.error("Napaka pri nalaganju neuspelih naslovov", error);
    return [] as CampaignFailure[];
  }
}

// Povzetek za nadzorno ploščo. "Novo letos" se veže na joined_at (datum včlanitve),
// ne na created_at, ker je za klub pomembno, kdaj je član pristopil, ne kdaj je bil
// vnesen v sistem. Vseh šest poizvedb teče vzporedno, da je skupaj en omrežni obhod.
export async function getDashboardOverview(): Promise<DashboardOverview> {
  const year = new Date().getFullYear();
  const yearStart = `${year}-01-01`;

  const empty: DashboardOverview = {
    year,
    totalMembers: 0,
    activeMembers: 0,
    inactiveMembers: 0,
    pendingMembers: 0,
    newThisYear: 0,
    newMembersThisYear: [],
    recentActiveMembers: [],
  };

  const supabase = await getSupabaseOrNull();

  if (!supabase) {
    return empty;
  }

  try {
    const [total, active, inactive, pending, newOnes, activeList] =
      await Promise.all([
        supabase.from("members").select("*", { count: "exact", head: true }),
        supabase
          .from("members")
          .select("*", { count: "exact", head: true })
          .eq("membership_status", "active"),
        supabase
          .from("members")
          .select("*", { count: "exact", head: true })
          .eq("membership_status", "inactive"),
        supabase
          .from("members")
          .select("*", { count: "exact", head: true })
          .eq("membership_status", "pending"),
        supabase
          .from("members")
          .select("*")
          .gte("joined_at", yearStart)
          .order("joined_at", { ascending: false }),
        supabase
          .from("members")
          .select("*")
          .eq("membership_status", "active")
          .order("created_at", { ascending: false })
          .limit(8),
      ]);

    const newMembers = (newOnes.data ?? []) as Member[];

    return {
      year,
      totalMembers: total.count ?? 0,
      activeMembers: active.count ?? 0,
      inactiveMembers: inactive.count ?? 0,
      pendingMembers: pending.count ?? 0,
      newThisYear: newMembers.length,
      newMembersThisYear: newMembers.slice(0, 8),
      recentActiveMembers: (activeList.data ?? []) as Member[],
    };
  } catch (error) {
    console.error("Napaka pri nalaganju nadzorne plošče", error);
    return empty;
  }
}

export const PRINT_QUOTA_KEY = "print_monthly_quota";
const DEFAULT_PRINT_QUOTA = 300;

export async function getPrintMonthlyQuota() {
  const supabase = await getSupabaseOrNull();

  if (!supabase) {
    return DEFAULT_PRINT_QUOTA;
  }

  const { data, error } = await supabase
    .from("app_settings")
    .select("value")
    .eq("key", PRINT_QUOTA_KEY)
    .maybeSingle();

  if (error) {
    console.error("Napaka pri branju kvote kopij", error);
    return DEFAULT_PRINT_QUOTA;
  }

  const parsed = Number(data?.value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_PRINT_QUOTA;
}

// Mesečni pregled porabe kopij. Vrstice sestavimo iz zapisov izbranega meseca,
// porabo prejšnjega meseca pa pripnemo za primerjavo. Popravki so zapisi z
// negativno količino, zato preprosto seštevanje deluje za oboje.
export async function getPrintOverview(monthParam?: string): Promise<PrintOverview> {
  const month = parseMonthParam(monthParam);
  const previous = new Date(month);
  previous.setMonth(previous.getMonth() - 1);

  const base: PrintOverview = {
    monthParam: toMonthParam(month),
    monthLabel: formatMonthLabel(month),
    previousParam: toMonthParam(previous),
    previousLabel: formatMonthLabel(previous),
    quota: DEFAULT_PRINT_QUOTA,
    totalUsed: 0,
    totalQuota: 0,
    totalRemaining: 0,
    membersCopied: 0,
    totalMembers: 0,
    readOnly: toMonthParam(month) !== toMonthParam(startOfCurrentMonth()),
    rows: [],
  };

  const supabase = await getSupabaseOrNull();

  if (!supabase) {
    return base;
  }

  const now = monthRange(month);
  const before = monthRange(previous);

  const select =
    "id, member_id, title, quantity, notes, created_at, members:member_id ( id, first_name, last_name )";

  try {
    const [quota, memberCount, current, prior] = await Promise.all([
      getPrintMonthlyQuota(),
      supabase.from("members").select("*", { count: "exact", head: true }),
      supabase
        .from("print_records")
        .select(select)
        .gte("created_at", now.start.toISOString())
        .lt("created_at", now.end.toISOString())
        .order("created_at", { ascending: false }),
      supabase
        .from("print_records")
        .select("member_id, quantity")
        .gte("created_at", before.start.toISOString())
        .lt("created_at", before.end.toISOString()),
    ]);

    if (current.error) throw current.error;

    type Row = {
      id: string;
      member_id: string | null;
      title: string | null;
      quantity: number | null;
      notes: string | null;
      created_at: string;
      members: { id: string; first_name: string; last_name: string } | null;
    };

    const priorByMember = new Map<string, number>();
    for (const r of (prior.data ?? []) as { member_id: string | null; quantity: number | null }[]) {
      if (!r.member_id) continue;
      priorByMember.set(r.member_id, (priorByMember.get(r.member_id) ?? 0) + (r.quantity ?? 0));
    }

    const byMember = new Map<string, PrintMemberRow>();
    for (const row of (current.data ?? []) as Row[]) {
      if (!row.member_id || !row.members) continue;

      const existing = byMember.get(row.member_id) ?? {
        memberId: row.member_id,
        fullName: getMemberFullName(row.members),
        used: 0,
        remaining: 0,
        previousMonth: priorByMember.get(row.member_id) ?? 0,
        entries: [],
      };

      existing.used += row.quantity ?? 0;
      existing.entries.push({
        id: row.id,
        title: row.title,
        quantity: row.quantity ?? 0,
        notes: row.notes,
        created_at: row.created_at,
      });
      byMember.set(row.member_id, existing);
    }

    const rows = [...byMember.values()]
      .map((r) => ({ ...r, remaining: quota - r.used }))
      .sort((a, b) => b.used - a.used);

    const totalUsed = rows.reduce((sum, r) => sum + r.used, 0);
    // Kvoto dobi vsak član kluba, ne le tisti, ki so ta mesec kopirali.
    const totalMembers = memberCount.count ?? 0;
    const totalQuota = totalMembers * quota;

    return {
      ...base,
      quota,
      rows,
      totalUsed,
      totalQuota,
      totalRemaining: totalQuota - totalUsed,
      membersCopied: rows.filter((r) => r.used > 0).length,
      totalMembers,
    };
  } catch (error) {
    console.error("Napaka pri nalaganju evidence tiska", error);
    return base;
  }
}

// Meseci, za katere obstajajo zapisi, plus tekoči. Iz tega nastane seznam
// mesečnih poročil; pretekli so samo za branje.
export async function getPrintMonths(): Promise<PrintMonthSummary[]> {
  const current = toMonthParam(startOfCurrentMonth());
  const supabase = await getSupabaseOrNull();

  const empty: PrintMonthSummary = {
    param: current,
    label: formatMonthLabel(startOfCurrentMonth()),
    totalCopies: 0,
    membersCopied: 0,
    isCurrent: true,
  };

  if (!supabase) {
    return [empty];
  }

  const { data, error } = await supabase
    .from("print_records")
    .select("member_id, quantity, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Napaka pri branju mesecev evidence tiska", error);
    return [empty];
  }

  const byMonth = new Map<string, { total: number; members: Set<string> }>();

  for (const row of data ?? []) {
    const param = toMonthParam(new Date(row.created_at));
    const entry = byMonth.get(param) ?? { total: 0, members: new Set<string>() };
    entry.total += row.quantity ?? 0;
    if (row.member_id) entry.members.add(row.member_id);
    byMonth.set(param, entry);
  }

  if (!byMonth.has(current)) {
    byMonth.set(current, { total: 0, members: new Set() });
  }

  return [...byMonth.entries()]
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([param, v]) => ({
      param,
      label: formatMonthLabel(parseMonthParam(param)),
      totalCopies: v.total,
      membersCopied: v.members.size,
      isCurrent: param === current,
    }));
}

const emptyApplicationCounts: ApplicationCounts = {
  all: 0,
  pending: 0,
  approved: 0,
  rejected: 0,
};

/**
 * Prijave za članstvo, po potrebi filtrirane po stanju.
 *
 * Potrdila živijo v zasebnem vedru, zato jih ni mogoče povezati naravnost -
 * za vsako naredimo podpisano povezavo, ki po eni uri poteče.
 */
export async function getApplications(status: ApplicationStatus | "all" = "all") {
  const supabase = await getSupabaseOrNull();

  if (!supabase) {
    return { rows: [] as ApplicationRow[], counts: emptyApplicationCounts };
  }

  try {
    let query = supabase
      .from("membership_applications")
      .select("*")
      .order("created_at", { ascending: false });

    if (status !== "all") {
      query = query.eq("status", status);
    }

    const [{ data, error }, { data: statusRows, error: statusError }] =
      await Promise.all([
        query,
        supabase.from("membership_applications").select("status"),
      ]);

    if (error) {
      throw error;
    }

    if (statusError) {
      throw statusError;
    }

    const counts = { ...emptyApplicationCounts };

    for (const row of statusRows ?? []) {
      counts.all += 1;
      counts[row.status] += 1;
    }

    const rows = await Promise.all(
      (data ?? []).map(async (application) => {
        if (!application.proof_path) {
          return { ...application, proofUrl: null };
        }

        const { data: signed } = await supabase.storage
          .from("potrdila")
          .createSignedUrl(application.proof_path, 60 * 60);

        return { ...application, proofUrl: signed?.signedUrl ?? null };
      }),
    );

    return { rows: rows as ApplicationRow[], counts };
  } catch (error) {
    console.error("Napaka pri nalaganju prijav za članstvo", error);
    return { rows: [] as ApplicationRow[], counts: emptyApplicationCounts };
  }
}
