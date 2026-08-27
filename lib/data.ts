import { notificationAudienceOptions } from "@/lib/constants";
import {
  getNotificationAudienceCounts,
  groupEmailLogsIntoCampaigns,
} from "@/lib/notifications";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";
import type {
  DashboardOverview,
  EmailCampaign,
  Member,
  MemberFilters,
  MemberOption,
  MemberRegistrationHistoryItem,
  NotificationAudienceCount,
  PrintRecordWithMember,
} from "@/types/app";

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

export async function getPrintRecords() {
  const supabase = await getSupabaseOrNull();

  if (!supabase) {
    return [] as PrintRecordWithMember[];
  }

  const { data, error } = await supabase
    .from("print_records")
    .select(
      "id, member_id, title, quantity, notes, created_at, members:member_id ( id, first_name, last_name )",
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Napaka pri nalaganju evidence tiska", error);
    return [] as PrintRecordWithMember[];
  }

  const printRows = (data ?? []) as Array<{
    id: string;
    member_id: string | null;
    title: string | null;
    quantity: number | null;
    notes: string | null;
    created_at: string;
    members: PrintRecordWithMember["member"];
  }>;

  return printRows.map((item) => ({
    id: item.id,
    member_id: item.member_id,
    title: item.title,
    quantity: item.quantity,
    notes: item.notes,
    created_at: item.created_at,
    member: item.members,
  })) as PrintRecordWithMember[];
}

export async function getNotificationAudiences() {
  const supabase = await getSupabaseOrNull();

  if (!supabase) {
    return notificationAudienceOptions.map((option) => ({
      value: option.value,
      label: option.label,
      count: 0,
    })) as NotificationAudienceCount[];
  }

  try {
    return await getNotificationAudienceCounts(supabase);
  } catch (error) {
    console.error("Napaka pri nalaganju skupin za obveščanje", error);
    return notificationAudienceOptions.map((option) => ({
      value: option.value,
      label: option.label,
      count: 0,
    })) as NotificationAudienceCount[];
  }
}

export async function getEmailCampaigns() {
  const supabase = await getSupabaseOrNull();

  if (!supabase) {
    return [] as EmailCampaign[];
  }

  const { data, error } = await supabase
    .from("email_logs")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Napaka pri nalaganju email zgodovine", error);
    return [] as EmailCampaign[];
  }

  return groupEmailLogsIntoCampaigns(
    (data ?? []) as Database["public"]["Tables"]["email_logs"]["Row"][],
  );
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
