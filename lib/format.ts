import {
  endOfMonth,
  format,
  isValid,
  parse,
  parseISO,
  startOfMonth,
} from "date-fns";
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

export function formatCurrency(value?: number | null) {
  return new Intl.NumberFormat("sl-SI", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(value ?? 0);
}

export function toDateInputValue(value?: string | null) {
  if (!value) return "";

  try {
    return format(parseISO(value), "yyyy-MM-dd");
  } catch {
    return "";
  }
}

export function toDateTimeLocalInputValue(value?: string | null) {
  if (!value) return "";

  try {
    return format(parseISO(value), "yyyy-MM-dd'T'HH:mm");
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

export function parseMonthParam(value?: string) {
  const fallback = startOfMonth(new Date());

  if (!value) return fallback;

  const parsed = parse(value, "yyyy-MM", new Date());
  return isValid(parsed) ? startOfMonth(parsed) : fallback;
}

export function toMonthParam(value: Date) {
  return format(value, "yyyy-MM");
}

export function formatMonthLabel(value: Date) {
  return format(value, "LLLL yyyy", { locale: sl });
}

export function isWithinSameMonth(value: Date, month: Date) {
  return value.getMonth() === month.getMonth() && value.getFullYear() === month.getFullYear();
}

export function getMonthDateRange(value: Date) {
  return {
    start: startOfMonth(value),
    end: endOfMonth(value),
  };
}
