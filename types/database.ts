export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type MembershipStatus = "active" | "inactive" | "pending";
export type EventStatus =
  | "upcoming"
  | "ongoing"
  | "completed"
  | "cancelled";
export type RegistrationStatus =
  | "registered"
  | "confirmed"
  | "cancelled"
  | "attended";
// Stanje enega prejemnika v čakalni vrsti.
export type QueueItemStatus = "pending" | "sending" | "sent" | "failed";
// Stanje celotne kampanje: v vrsti, se pošilja, na pavzi, končana.
export type CampaignStatus = "queued" | "sending" | "paused" | "sent";
export type CampaignType = "obvestilo" | "dogodek" | "ugodnost" | "novice";
// Iz šole člana izpeljana skupina. "unknown" pomeni, da šole ni bilo mogoče
// uvrstiti - član ostane dosegljiv prek skupine "vsi člani".
export type MemberSegment = "student" | "pupil" | "unknown";
export type NotificationAudience =
  | "all"
  | "students"
  | "pupils"
  | "active"
  | "inactive"
  | "pending";

export interface Database {
  public: {
    Tables: {
      app_settings: {
        Row: {
          key: string;
          value: string;
          updated_at: string;
        };
        Insert: {
          key: string;
          value: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["app_settings"]["Insert"]>;
        Relationships: [];
      };
      members: {
        Row: {
          id: string;
          first_name: string;
          last_name: string;
          emso: string | null;
          email: string | null;
          phone: string | null;
          birth_date: string | null;
          address: string | null;
          postal_code: string | null;
          city: string | null;
          faculty: string | null;
          membership_status: MembershipStatus;
          membership_year: number | null;
          membership_paid: boolean;
          membership_fee: number | null;
          joined_at: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          first_name: string;
          last_name: string;
          emso?: string | null;
          email?: string | null;
          phone?: string | null;
          birth_date?: string | null;
          address?: string | null;
          postal_code?: string | null;
          city?: string | null;
          faculty?: string | null;
          membership_status?: MembershipStatus;
          membership_year?: number | null;
          membership_paid?: boolean;
          membership_fee?: number | null;
          joined_at?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["members"]["Insert"]>;
        Relationships: [];
      };
      events: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          location: string | null;
          starts_at: string;
          ends_at: string | null;
          max_attendees: number | null;
          status: EventStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          location?: string | null;
          starts_at: string;
          ends_at?: string | null;
          max_attendees?: number | null;
          status?: EventStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["events"]["Insert"]>;
        Relationships: [];
      };
      event_registrations: {
        Row: {
          id: string;
          member_id: string | null;
          event_id: string | null;
          status: RegistrationStatus;
          registered_at: string;
          notes: string | null;
        };
        Insert: {
          id?: string;
          member_id?: string | null;
          event_id?: string | null;
          status?: RegistrationStatus;
          registered_at?: string;
          notes?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["event_registrations"]["Insert"]>;
        Relationships: [];
      };
      coupons: {
        Row: {
          id: string;
          code: string;
          description: string | null;
          discount_type: string | null;
          discount_value: number | null;
          valid_from: string | null;
          valid_to: string | null;
          active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          description?: string | null;
          discount_type?: string | null;
          discount_value?: number | null;
          valid_from?: string | null;
          valid_to?: string | null;
          active?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["coupons"]["Insert"]>;
        Relationships: [];
      };
      print_records: {
        Row: {
          id: string;
          member_id: string | null;
          title: string | null;
          quantity: number | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          member_id?: string | null;
          title?: string | null;
          quantity?: number | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["print_records"]["Insert"]>;
        Relationships: [];
      };
      email_campaigns: {
        Row: {
          id: string;
          title: string;
          subtitle: string | null;
          content_html: string;
          cta_label: string | null;
          cta_url: string | null;
          campaign_type: CampaignType;
          audience: NotificationAudience;
          daily_limit: number;
          status: CampaignStatus;
          total_recipients: number;
          created_by: string | null;
          created_at: string;
          updated_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          subtitle?: string | null;
          content_html: string;
          cta_label?: string | null;
          cta_url?: string | null;
          campaign_type?: CampaignType;
          audience?: NotificationAudience;
          daily_limit?: number;
          status?: CampaignStatus;
          total_recipients?: number;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
          completed_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["email_campaigns"]["Insert"]>;
        Relationships: [];
      };
      email_queue: {
        Row: {
          id: string;
          campaign_id: string;
          member_id: string | null;
          to_email: string;
          first_name: string | null;
          last_name: string | null;
          segment: MemberSegment | null;
          status: QueueItemStatus;
          error_message: string | null;
          attempts: number;
          claimed_at: string | null;
          sent_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          campaign_id: string;
          member_id?: string | null;
          to_email: string;
          first_name?: string | null;
          last_name?: string | null;
          segment?: MemberSegment | null;
          status?: QueueItemStatus;
          error_message?: string | null;
          attempts?: number;
          claimed_at?: string | null;
          sent_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["email_queue"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
