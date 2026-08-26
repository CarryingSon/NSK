import { z } from "zod";

import type { EventStatus, MembershipStatus, RegistrationStatus } from "@/types/database";
import type { NotificationAudience } from "@/types/app";

const optionalString = z
  .string()
  .trim()
  .transform((value) => (value.length > 0 ? value : null))
  .nullable()
  .optional();

const optionalInteger = z.preprocess((value) => {
  if (value === "" || value === null || value === undefined) return null;
  const numberValue = Number(value);
  return Number.isNaN(numberValue) ? value : numberValue;
}, z.number().int().nullable());

const optionalDate = z
  .string()
  .trim()
  .transform((value) => (value.length > 0 ? value : null))
  .nullable();

const optionalDateTime = z
  .string()
  .trim()
  .transform((value) => (value.length > 0 ? new Date(value).toISOString() : null))
  .nullable();

const optionalUuid = z.preprocess((value) => {
  if (value === "" || value === null || value === undefined) return null;
  return value;
}, z.string().uuid().nullable());

const positiveInteger = z.preprocess((value) => {
  const numberValue = Number(value);
  return Number.isNaN(numberValue) ? value : numberValue;
}, z.number().int().min(1, "Vnesi količino vsaj 1."));

// Interni admin se prijavi z uporabniškim imenom "admin", Supabase Auth pa pozna
// samo e-poštne naslove. Preslikavo hranimo v ADMIN_EMAIL (ni NEXT_PUBLIC, ker
// validation.ts uvažajo izključno strežniške akcije), da naslov ne konča v repozitoriju.
export const adminUsername = "admin";

const adminEmail = process.env.ADMIN_EMAIL?.trim();

export function resolveLoginIdentifier(identifier: string) {
  const value = identifier.trim();

  if (!value || value.includes("@")) {
    return value;
  }

  if (value.toLowerCase() === adminUsername && adminEmail) {
    return adminEmail;
  }

  // Neznano uporabniško ime pustimo pri miru; refine ga zavrne kot neveljavnega.
  return value;
}

export const loginSchema = z.object({
  // Polje sprejme uporabniško ime ali e-pošto; navzven je vedno e-pošta.
  email: z
    .string()
    .trim()
    .min(1, "Vnesi uporabniško ime ali e-pošto.")
    .transform(resolveLoginIdentifier)
    .refine(
      (value) => z.email().safeParse(value).success,
      "Vnesi veljavno uporabniško ime ali e-pošto.",
    ),
  password: z.string().min(6, "Geslo mora imeti vsaj 6 znakov."),
});

export const memberSchema = z.object({
  id: z.string().uuid().optional(),
  first_name: z.string().trim().min(2, "Ime je obvezno."),
  last_name: z.string().trim().min(2, "Priimek je obvezen."),
  email: z
    .string()
    .trim()
    .transform((value) => (value.length > 0 ? value : null))
    .refine((value) => value === null || z.string().email().safeParse(value).success, {
      message: "Vnesi veljaven e-poštni naslov.",
    }),
  phone: optionalString,
  birth_date: optionalDate,
  address: optionalString,
  postal_code: optionalString,
  city: optionalString,
  faculty: z.string().trim().min(1, "Izberi fakulteto ali visokošolski zavod."),
  membership_status: z.enum([
    "active",
    "inactive",
    "pending",
  ] as [MembershipStatus, MembershipStatus, MembershipStatus]),
  membership_year: optionalInteger,
  joined_at: optionalDate,
  notes: optionalString,
});

export const eventSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().trim().min(3, "Naslov dogodka je obvezen."),
  description: optionalString,
  location: optionalString,
  starts_at: z
    .string()
    .trim()
    .min(1, "Datum začetka je obvezen.")
    .transform((value) => new Date(value).toISOString()),
  ends_at: optionalDateTime,
  max_attendees: optionalInteger,
  status: z.enum([
    "upcoming",
    "ongoing",
    "completed",
    "cancelled",
  ] as [EventStatus, EventStatus, EventStatus, EventStatus]),
});

export const registrationSchema = z.object({
  id: z.string().uuid().optional(),
  member_id: z.string().uuid("Izberi člana."),
  event_id: z.string().uuid("Izberi dogodek."),
  status: z.enum([
    "registered",
    "confirmed",
    "cancelled",
    "attended",
  ] as [
    RegistrationStatus,
    RegistrationStatus,
    RegistrationStatus,
    RegistrationStatus,
  ]),
  notes: optionalString,
});

export const printRecordSchema = z.object({
  member_id: optionalUuid,
  title: z.string().trim().min(2, "Vnesi naziv tiskovine."),
  quantity: positiveInteger,
  notes: optionalString,
});

export const notificationSchema = z.object({
  audience: z.enum([
    "all",
    "active",
    "inactive",
    "pending",
  ] as [
    NotificationAudience,
    NotificationAudience,
    NotificationAudience,
    NotificationAudience,
  ]),
  subject: z.string().trim().min(3, "Zadeva mora imeti vsaj 3 znake."),
  body: z.string().trim().min(10, "Sporočilo mora imeti vsaj 10 znakov."),
});
