import { z } from "zod";

import { emailDailyLimit } from "@/lib/constants";
import { hasRichTextContent, sanitizeRichText } from "@/lib/email-content";
import type { MembershipStatus } from "@/types/database";

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

// EMŠO je 13 števk v obliki DDMMLLL RR BBB K, kjer je zadnja kontrolna.
// Izračuna se iz utežene vsote prvih dvanajstih po zaporedju 7,6,5,4,3,2 (dvakrat).
// Preverjanje same dolžine ne bi ujelo tipkarske napake, kontrolna števka pa jo.
export function isValidEmso(value: string) {
  if (!/^\d{13}$/.test(value)) {
    return false;
  }

  const digits = [...value].map(Number);
  const weights = [7, 6, 5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  const sum = weights.reduce(
    (total, weight, index) => total + weight * digits[index],
    0,
  );

  const remainder = 11 - (sum % 11);
  const checksum = remainder > 9 ? 0 : remainder;

  return checksum === digits[12];
}

export const memberSchema = z.object({
  id: z.string().uuid().optional(),
  first_name: z.string().trim().min(2, "Ime je obvezno."),
  last_name: z.string().trim().min(2, "Priimek je obvezen."),
  // Na prijavnici je EMŠO obvezen - klub ga potrebuje za evidenco članstva.
  // Ločeni sporočili: prazno polje in tipkarska napaka nista ista težava.
  emso: z
    .string()
    .trim()
    .transform((value) => value.replace(/\s/g, ""))
    .refine((value) => value.length > 0, { message: "Vnesi EMŠO." })
    .refine((value) => value.length === 0 || isValidEmso(value), {
      message: "EMŠO mora imeti 13 števk in veljavno kontrolno številko.",
    }),
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

// Poraba kopij: "Dodaj" prišteje, "Prilagodi" odšteje. Obe poti sprejmeta samo
// pozitivno število, predznak določi akcija - tako se ne da pomotoma prišteti minusa.
export const printCopiesSchema = z.object({
  member_id: z.string().uuid("Izberi člana."),
  quantity: z.preprocess((value) => {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? value : parsed;
  }, z.number().int().min(1, "Vnesi vsaj 1 kopijo.")),
  note: optionalString,
});

export const printQuotaSchema = z.object({
  quota: z.preprocess((value) => {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? value : parsed;
  }, z.number().int().min(1, "Kvota mora biti vsaj 1.").max(100000, "Kvota je previsoka.")),
});

// Kampanja obveščanja. Vsebina je HTML iz urejevalnika, zato jo očistimo že v
// shemi - naprej gre samo tisto, kar se sme prikazati v e-pošti.
export const campaignSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, "Naslov obvestila mora imeti vsaj 3 znake.")
      .max(150, "Naslov obvestila je predolg."),
    subtitle: z
      .string()
      .trim()
      .max(120, "Podnaslov je predolg.")
      .transform((value) => (value.length > 0 ? value : null))
      .nullable(),
    content: z
      .string()
      .transform((value) => sanitizeRichText(value))
      .refine((value) => hasRichTextContent(value), {
        message: "Vsebina obvestila ne sme biti prazna.",
      }),
    ctaLabel: z
      .string()
      .trim()
      .max(60, "Besedilo gumba je predolgo.")
      .transform((value) => (value.length > 0 ? value : null))
      .nullable(),
    ctaUrl: z
      .string()
      .trim()
      .transform((value) => (value.length > 0 ? value : null))
      .nullable()
      .refine(
        (value) => value === null || /^https?:\/\//i.test(value),
        "URL gumba se mora začeti s http:// ali https://",
      ),
    campaignType: z.enum(["obvestilo", "dogodek", "ugodnost", "novice"]),
    audience: z.enum([
      "all",
      "students",
      "pupils",
      "active",
      "inactive",
      "pending",
    ]),
    dailyLimit: z.preprocess((value) => {
      const parsed = Number(value);
      return Number.isNaN(parsed) ? value : parsed;
    }, z
      .number()
      .int()
      .min(1, "Dnevna omejitev mora biti vsaj 1.")
      .max(
        emailDailyLimit,
        `Dnevna omejitev ne sme presegati ${emailDailyLimit} sporočil.`,
      )),
  })
  // Gumb brez naslova ali naslov brez besedila v e-pošti nista uporabna, zato
  // sta polji vezani druga na drugo.
  .refine((value) => !(value.ctaLabel && !value.ctaUrl), {
    message: "Gumb potrebuje tudi URL.",
    path: ["ctaUrl"],
  })
  .refine((value) => !(value.ctaUrl && !value.ctaLabel), {
    message: "Gumb potrebuje tudi besedilo.",
    path: ["ctaLabel"],
  });

// Testno pošiljanje uporabi isto shemo za vsebino, naslov prejemnika pa je
// posebej - obrazec ga pošlje samo pri testu.
export const testEmailSchema = z.object({
  testEmail: z.email("Vnesi veljaven e-poštni naslov za test."),
});

// Prijavnica z javnega obrazca. Pravila so ohlapnejša od memberSchema, ker jo
// izpolnjuje obiskovalec brez pomoči: EMŠO in status članstva doda klub pozneje,
// ob prenosu prijave med člane.
export const applicationSchema = z.object({
  first_name: z.string().trim().min(2, "Vnesi ime."),
  last_name: z.string().trim().min(2, "Vnesi priimek."),
  email: z.email("Vnesi veljaven e-poštni naslov."),
  phone: optionalString,
  birth_date: optionalDate,
  // Na prijavnici je EMŠO obvezen - klub ga potrebuje za evidenco članstva.
  // Ločeni sporočili: prazno polje in tipkarska napaka nista ista težava.
  emso: z
    .string()
    .trim()
    .transform((value) => value.replace(/\s/g, ""))
    .refine((value) => value.length > 0, { message: "Vnesi EMŠO." })
    .refine((value) => value.length === 0 || isValidEmso(value), {
      message: "EMŠO mora imeti 13 števk in veljavno kontrolno številko.",
    }),
  address: optionalString,
  postal_code: optionalString,
  city: optionalString,
  school: z.string().trim().min(2, "Vnesi šolo oziroma fakulteto."),
  study_program: optionalString,
  study_year: optionalString,
  member_type: z.enum(["student", "pupil"]),
  message: optionalString,
});

export const applicationStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["pending", "approved", "rejected"]),
});
