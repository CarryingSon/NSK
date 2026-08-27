import { format, parseISO } from "date-fns";
import { sl } from "date-fns/locale";

import type { Member } from "@/types/app";

export function formatDate(
  value?: string | null,
  pattern = "d. MMM yyyy",
) {
  if (!value) return "—";

  try {
    return format(parseISO(value), pattern, { locale: sl });
  } catch {
    return "—";
  }
}

export function formatDateTime(value?: string | null) {
  if (!value) return "—";

  try {
    return format(parseISO(value), "d. MMM yyyy, HH:mm", { locale: sl });
  } catch {
    return "—";
  }
}

export function toDateInputValue(value?: string | null) {
  if (!value) return "";

  try {
    return format(parseISO(value), "yyyy-MM-dd");
  } catch {
    return "";
  }
}

export function getMemberFullName(member?: Pick<Member, "first_name" | "last_name"> | null) {
  if (!member) return "Neznan član";

  return `${member.first_name} ${member.last_name}`.trim();
}

export function getInitials(value?: string | null) {
  if (!value) return "P";

  return value
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

