import type {
  Database,
  EventStatus,
  EmailLogStatus,
  MembershipStatus,
  RegistrationStatus,
} from "@/types/database";

export type Member = Database["public"]["Tables"]["members"]["Row"];
export type Event = Database["public"]["Tables"]["events"]["Row"];
export type Registration =
  Database["public"]["Tables"]["event_registrations"]["Row"];
export type Coupon = Database["public"]["Tables"]["coupons"]["Row"];
export type PrintRecord = Database["public"]["Tables"]["print_records"]["Row"];
export type EmailLog = Database["public"]["Tables"]["email_logs"]["Row"];

export interface ActionState {
  error?: string;
  success?: string;
}

export interface DashboardStats {
  activeMembers: number;
  inactiveMembers: number;
  pendingApplications: number;
  upcomingEvents: number;
}

export interface CalendarEvent {
  id: string;
  title: string;
  location: string | null;
  starts_at: string;
  ends_at: string | null;
  status: EventStatus;
}

export interface RegistrationWithRelations extends Registration {
  member: Pick<Member, "id" | "first_name" | "last_name" | "email"> | null;
  event: Pick<Event, "id" | "title" | "starts_at" | "location"> | null;
}

export interface PrintRecordWithMember extends PrintRecord {
  member: Pick<Member, "id" | "first_name" | "last_name"> | null;
}

export interface MemberRegistrationHistoryItem {
  id: string;
  status: RegistrationStatus;
  registered_at: string;
  notes: string | null;
  event: Pick<Event, "id" | "title" | "starts_at" | "location" | "status"> | null;
}

export interface StatusOption<TValue extends string> {
  value: TValue;
  label: string;
}

export interface MemberFilters {
  query?: string;
  status?: MembershipStatus | "all";
}

export type NotificationAudience = "all" | "active" | "inactive" | "pending" | "unpaid";

export interface NotificationAudienceCount {
  value: NotificationAudience;
  label: string;
  count: number;
}

export interface EmailCampaign {
  subject: string;
  body: string | null;
  sentAt: string;
  totalSent: number;
  successCount: number;
  failedCount: number;
  metadata: string | null;
  failedRecipients: Array<{
    email: string;
    error: string | null;
  }>;
}

export interface EmailLogMetadata {
  audience: NotificationAudience;
  createdByEmail?: string | null;
  sentByName?: string | null;
}

export interface EmailDeliveryResult {
  status: EmailLogStatus;
  errorMessage?: string | null;
}
