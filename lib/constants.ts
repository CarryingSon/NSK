import type { LucideIcon } from "lucide-react";
import {
  Bell,
  Info,
  LogOut,
  Newspaper,
  Settings,
  Users,
} from "lucide-react";

import type { MembershipStatus } from "@/types/database";
import type { StatusOption } from "@/types/app";

export const appName = "Poziralnik";

export interface NavigationItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const primaryNavigation: NavigationItem[] = [
  { href: "/members", label: "Člani", icon: Users },
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

export const weekdays = ["Pon", "Tor", "Sre", "Čet", "Pet", "Sob", "Ned"];
