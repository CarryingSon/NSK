import { addMonths, format, parseISO, startOfMonth } from "date-fns";
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

// Mesec v naslovu kot "2026-08". Neveljaven ali manjkajoč pomeni tekoči mesec.
export function parseMonthParam(value?: string) {
  if (value && /^\d{4}-\d{2}$/.test(value)) {
    const parsed = new Date(`${value}-01T00:00:00`);
    if (!Number.isNaN(parsed.getTime())) {
      return startOfMonth(parsed);
    }
  }

  return startOfMonth(new Date());
}

export function toMonthParam(value: Date) {
  return format(value, "yyyy-MM");
}

export function formatMonthLabel(value: Date) {
  const label = format(value, "LLLL yyyy", { locale: sl });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function monthRange(value: Date) {
  const start = startOfMonth(value);
  return { start, end: addMonths(start, 1) };
}

export function startOfCurrentMonth() {
  return startOfMonth(new Date());
}
