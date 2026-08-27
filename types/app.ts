import type {
  Database,
  EmailLogStatus,
  MembershipStatus,
  RegistrationStatus,
} from "@/types/database";

export type Member = Database["public"]["Tables"]["members"]["Row"];
export type Event = Database["public"]["Tables"]["events"]["Row"];
export type PrintRecord = Database["public"]["Tables"]["print_records"]["Row"];
export type EmailLog = Database["public"]["Tables"]["email_logs"]["Row"];

// Ožji izsek člana za spustne sezname - dovolj za prikaz imena in izbiro vrednosti.
export type MemberOption = Pick<Member, "id" | "first_name" | "last_name">;

// Povzetek za nadzorno ploščo: stanje članstva in prirast v tekočem letu.
export interface DashboardOverview {
  year: number;
  totalMembers: number;
  activeMembers: number;
  inactiveMembers: number;
  pendingMembers: number;
  newThisYear: number;
  newMembersThisYear: Member[];
  recentActiveMembers: Member[];
}

export interface ActionState {
  error?: string;
  success?: string;
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

export interface PrintEntry {
  id: string;
  title: string | null;
  quantity: number;
  notes: string | null;
  created_at: string;
}

export interface PrintMemberRow {
  memberId: string;
  fullName: string;
  used: number;
  remaining: number;
  previousMonth: number;
  entries: PrintEntry[];
}

// Mesečni pregled porabe kopij: kartice na vrhu in vrstice po članih.
export interface PrintOverview {
  monthParam: string;
  monthLabel: string;
  previousParam: string;
  previousLabel: string;
  quota: number;
  totalUsed: number;
  totalQuota: number;
  totalRemaining: number;
  membersCopied: number;
  rows: PrintMemberRow[];
}

export interface StatusOption<TValue extends string> {
  value: TValue;
  label: string;
}

export interface MemberFilters {
  query?: string;
  status?: MembershipStatus | "all";
}

export type NotificationAudience = "all" | "active" | "inactive" | "pending";

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
