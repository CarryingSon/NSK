import type { LucideIcon } from "lucide-react";
import {
  Bell,
  CalendarDays,
  ClipboardList,
  Home,
  Info,
  LogOut,
  Newspaper,
  Settings,
  Ticket,
  Users,
} from "lucide-react";

import type {
  EventStatus,
  MembershipStatus,
  RegistrationStatus,
} from "@/types/database";
import type { StatusOption } from "@/types/app";

export const appName = "Poziralnik";

export interface NavigationItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const primaryNavigation: NavigationItem[] = [
  { href: "/dashboard", label: "Domov", icon: Home },
  { href: "/members", label: "Člani", icon: Users },
  { href: "/registrations", label: "Prijave", icon: ClipboardList },
  { href: "/events", label: "Dogodki", icon: CalendarDays },
  { href: "/coupons", label: "Kupončki", icon: Ticket },
  { href: "/print-records", label: "Evidenca tiska", icon: Newspaper },
  { href: "/notifications", label: "Obveščanje", icon: Bell },
  { href: "/notifications/history", label: "Zgodovina obvestil", icon: Bell },
  { href: "/settings", label: "Nastavitve", icon: Settings },
  { href: "/info", label: "Info", icon: Info },
];

export const logoutItem = {
  label: "Odjava",
  icon: LogOut,
};

export const membershipStatusOptions: StatusOption<MembershipStatus>[] = [
  { value: "active", label: "Aktiven" },
  { value: "inactive", label: "Neaktiven" },
  { value: "pending", label: "V postopku" },
];

export const eventStatusOptions: StatusOption<EventStatus>[] = [
  { value: "upcoming", label: "Prihajajoč" },
  { value: "ongoing", label: "V teku" },
  { value: "completed", label: "Zaključen" },
  { value: "cancelled", label: "Odpovedan" },
];

export const registrationStatusOptions: StatusOption<RegistrationStatus>[] = [
  { value: "registered", label: "Prijavljen" },
  { value: "confirmed", label: "Potrjen" },
  { value: "cancelled", label: "Odpovedan" },
  { value: "attended", label: "Udeležen" },
];

export const weekdays = ["Pon", "Tor", "Sre", "Čet", "Pet", "Sob", "Ned"];
