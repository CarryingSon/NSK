import { z } from "zod";

import type {
  EventStatus,
  MembershipStatus,
  RegistrationStatus,
} from "@/types/database";

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

const optionalNumber = z.preprocess((value) => {
  if (value === "" || value === null || value === undefined) return null;
  const numberValue = Number(value);
  return Number.isNaN(numberValue) ? value : numberValue;
}, z.number().nonnegative().nullable());

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

export const loginSchema = z.object({
  email: z.string().trim().email("Vnesi veljaven e-poštni naslov."),
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
  membership_status: z.enum([
    "active",
    "inactive",
    "pending",
  ] as [MembershipStatus, MembershipStatus, MembershipStatus]),
  membership_year: optionalInteger,
  membership_paid: z.boolean().default(false),
  membership_fee: optionalNumber,
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
