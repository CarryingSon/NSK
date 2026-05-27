import {
  addDays,
  endOfMonth,
  endOfWeek,
  startOfMonth,
  startOfWeek,
} from "date-fns";

import { parseMonthParam } from "@/lib/format";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  CalendarEvent,
  Coupon,
  DashboardStats,
  Event,
  Member,
  MemberFilters,
  MemberRegistrationHistoryItem,
  PrintRecordWithMember,
  RegistrationWithRelations,
} from "@/types/app";

const emptyStats: DashboardStats = {
  activeMembers: 0,
  inactiveMembers: 0,
  pendingApplications: 0,
  upcomingEvents: 0,
};

async function getSupabaseOrNull() {
  if (!isSupabaseConfigured()) {
    return null;
  }

  return createSupabaseServerClient();
}

export async function getDashboardData(monthParam?: string) {
  const monthDate = parseMonthParam(monthParam);
  const calendarWindowStart = startOfWeek(startOfMonth(monthDate), {
    weekStartsOn: 1,
  });
  const calendarWindowEnd = endOfWeek(endOfMonth(monthDate), {
    weekStartsOn: 1,
  });

  const supabase = await getSupabaseOrNull();

  if (!supabase) {
    return {
      stats: emptyStats,
      events: [] as CalendarEvent[],
      monthDate,
      demoMode: true,
    };
  }

  try {
    const now = new Date();
    const nextThirtyDays = addDays(now, 30);

    const [
      activeMembers,
      inactiveMembers,
      pendingApplications,
      upcomingEvents,
      eventsResult,
    ] = await Promise.all([
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
        .from("events")
        .select("*", { count: "exact", head: true })
        .gte("starts_at", now.toISOString())
        .lte("starts_at", nextThirtyDays.toISOString()),
      supabase
        .from("events")
        .select("id, title, location, starts_at, ends_at, status")
        .gte("starts_at", calendarWindowStart.toISOString())
        .lte("starts_at", calendarWindowEnd.toISOString())
        .order("starts_at", { ascending: true }),
    ]);

    return {
      stats: {
        activeMembers: activeMembers.count ?? 0,
        inactiveMembers: inactiveMembers.count ?? 0,
        pendingApplications: pendingApplications.count ?? 0,
        upcomingEvents: upcomingEvents.count ?? 0,
      },
      events: (eventsResult.data ?? []) as CalendarEvent[],
      monthDate,
      demoMode: false,
    };
  } catch (error) {
    console.error("Napaka pri nalaganju dashboard podatkov", error);

    return {
      stats: emptyStats,
      events: [] as CalendarEvent[],
      monthDate,
      demoMode: true,
    };
  }
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

export async function getEvents() {
  const supabase = await getSupabaseOrNull();

  if (!supabase) {
    return {
      events: [] as Event[],
      demoMode: true,
    };
  }

  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("starts_at", { ascending: true });

  if (error) {
    console.error("Napaka pri nalaganju dogodkov", error);
    return {
      events: [] as Event[],
      demoMode: true,
    };
  }

  return {
    events: (data ?? []) as Event[],
    demoMode: false,
  };
}

export async function getEventsForSelect() {
  const { events } = await getEvents();
  return events;
}

export async function getMembersForSelect() {
  const { members } = await getMembers();
  return members;
}

export async function getRegistrations() {
  const supabase = await getSupabaseOrNull();

  if (!supabase) {
    return {
      registrations: [] as RegistrationWithRelations[],
      demoMode: true,
    };
  }

  const { data, error } = await supabase
    .from("event_registrations")
    .select(
      "id, member_id, event_id, status, registered_at, notes, members:member_id ( id, first_name, last_name, email ), events:event_id ( id, title, starts_at, location )",
    )
    .order("registered_at", { ascending: false });

  if (error) {
    console.error("Napaka pri nalaganju prijav", error);
    return {
      registrations: [] as RegistrationWithRelations[],
      demoMode: true,
    };
  }

  const registrationRows = (data ?? []) as Array<{
    id: string;
    member_id: string | null;
    event_id: string | null;
    status: RegistrationWithRelations["status"];
    registered_at: string;
    notes: string | null;
    members: RegistrationWithRelations["member"];
    events: RegistrationWithRelations["event"];
  }>;

  return {
    registrations: registrationRows.map((item) => ({
      id: item.id,
      member_id: item.member_id,
      event_id: item.event_id,
      status: item.status,
      registered_at: item.registered_at,
      notes: item.notes,
      member: item.members,
      event: item.events,
    })) as RegistrationWithRelations[],
    demoMode: false,
  };
}

export async function getCoupons() {
  const supabase = await getSupabaseOrNull();

  if (!supabase) {
    return [] as Coupon[];
  }

  const { data, error } = await supabase
    .from("coupons")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Napaka pri nalaganju kuponov", error);
    return [] as Coupon[];
  }

  return (data ?? []) as Coupon[];
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
