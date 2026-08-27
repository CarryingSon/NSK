import type {
  CampaignStatus,
  CampaignType,
  Database,
  MemberSegment,
  MembershipStatus,
  NotificationAudience,
  QueueItemStatus,
  RegistrationStatus,
} from "@/types/database";

export type Member = Database["public"]["Tables"]["members"]["Row"];
export type Event = Database["public"]["Tables"]["events"]["Row"];
export type PrintRecord = Database["public"]["Tables"]["print_records"]["Row"];
export type EmailCampaign = Database["public"]["Tables"]["email_campaigns"]["Row"];
export type EmailQueueItem = Database["public"]["Tables"]["email_queue"]["Row"];

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
  totalMembers: number;
  // Pretekli meseci so poročilo: prikažejo se enako, a se jih ne da spreminjati.
  readOnly: boolean;
  rows: PrintMemberRow[];
}

export interface PrintMonthSummary {
  param: string;
  label: string;
  totalCopies: number;
  membersCopied: number;
  isCurrent: boolean;
}

export interface StatusOption<TValue extends string> {
  value: TValue;
  label: string;
}

export interface MemberFilters {
  query?: string;
  status?: MembershipStatus | "all";
}

// Skupina prejemnikov s številom članov, ki jih zajame - izbirnik jo pokaže
// takoj ob izbiri, brez dodatnega klica na strežnik.
export interface NotificationAudienceOption {
  value: NotificationAudience;
  label: string;
  description: string;
  count: number;
}

// Razčlenitev članske baze po skupinah, ki jo pokaže panel pod izbirnikom.
export interface NotificationAudienceStats {
  options: NotificationAudienceOption[];
  totalWithEmail: number;
  students: number;
  pupils: number;
  unknown: number;
  active: number;
  inactive: number;
  // Koliko e-pošte je danes že odšlo in koliko je še ostane do dnevne omejitve.
  sentToday: number;
  remainingToday: number;
  dailyLimit: number;
}

// Kampanja skupaj s štetjem iz čakalne vrste - osnova za zgodovino in napredek.
export interface CampaignWithProgress extends EmailCampaign {
  pendingCount: number;
  sentCount: number;
  failedCount: number;
}

export interface CampaignFailure {
  email: string;
  name: string;
  error: string | null;
}

// Rezultat ene serije pošiljanja. Stran ga uporabi za napredek in za odločitev,
// ali sme sprožiti naslednjo serijo.
export interface DispatchBatchResult {
  sent: number;
  failed: number;
  pending: number;
  done: boolean;
  // Serija se ustavi, ko je dosežena dnevna omejitev - takrat ni napaka, le čakanje.
  dailyLimitReached: boolean;
  message: string;
}

export type {
  CampaignStatus,
  CampaignType,
  MemberSegment,
  NotificationAudience,
  QueueItemStatus,
};
