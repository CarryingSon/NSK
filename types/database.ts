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
export type EmailLogStatus = "sent" | "failed";

export interface Database {
  public: {
    Tables: {
      members: {
        Row: {
          id: string;
          first_name: string;
          last_name: string;
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
      email_logs: {
        Row: {
          id: string;
          to_email: string;
          subject: string;
          body: string | null;
          status: EmailLogStatus;
          error_message: string | null;
          metadata: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          to_email: string;
          subject: string;
          body?: string | null;
          status?: EmailLogStatus;
          error_message?: string | null;
          metadata?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["email_logs"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
