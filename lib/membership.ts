import type { Member } from "@/types/app";

/**
 * Članstvo teče po šolskem letu, ne po koledarskem.
 *
 * Leto članstva je letnica, s katero se šolsko leto začne: članstvo 2025/2026
 * ima membership_year 2025. Novo leto nastopi s septembrom, ko dijaki in
 * študenti prinesejo potrdilo o vpisu - do takrat velja prejšnje. Brez tega bi
 * januarja vsi člani naenkrat izpadli kot potekli, sredi šolskega leta.
 */
const schoolYearStartMonth = 8; // September, meseci se štejejo od 0.

export function getCurrentMembershipYear(now: Date = new Date()) {
  const year = now.getFullYear();

  return now.getMonth() >= schoolYearStartMonth ? year : year - 1;
}

/** 2025 -> "2025/2026". Klub tako piše leto povsod drugje. */
export function formatMembershipYear(year: number) {
  return `${year}/${year + 1}`;
}

/**
 * Šolsko leto, s katerim je klub začel zbirati EMŠO.
 *
 * Starejši člani ga v evidenci nimajo in ga tudi ne bodo dobili za nazaj -
 * vpiše se vsakemu posebej, ko se na novo vpiše. Zato EMŠO pri urejanju člana
 * ni obvezen, na prijavnici za nove člane pa je.
 */
export const emsoCollectionStartYear = 2026;

/**
 * Nadomestna naziva šole iz uvoza seznama 2025/2026.
 *
 * Datoteka nazivov šol ni vsebovala, zapisana sta bila samo toliko, da
 * obveščanje po skupinah Dijaki in Študenti deluje. Za evidenco to nista prava
 * podatka, zato pri dopolnjevanju štejeta kot manjkajoča.
 */
export const placeholderFaculties = ["Srednja šola", "Fakulteta"];

export function isPlaceholderFaculty(value?: string | null) {
  return Boolean(value && placeholderFaculties.includes(value.trim()));
}

export interface MissingMemberField {
  /** Ime polja v obrazcu; ujema se s stolpcem v tabeli members. */
  name: string;
  label: string;
  hint?: string;
}

// Vrstni red je vrstni red izpolnjevanja za pultom: najprej tisto, kar piše na
// pristopni izjavi, nato kontakt in na koncu naslov.
const trackedFields: Array<{
  name: keyof Member & string;
  label: string;
  hint?: string;
  isMissing: (member: Member) => boolean;
}> = [
  {
    name: "emso",
    label: "EMŠO",
    hint: "13 števk s pristopne izjave.",
    isMissing: (member) => !member.emso,
  },
  {
    name: "birth_date",
    label: "Datum rojstva",
    isMissing: (member) => !member.birth_date,
  },
  {
    name: "faculty",
    label: "Šola oziroma fakulteta",
    hint: "Pravi naziv s potrdila o vpisu.",
    isMissing: (member) =>
      !member.faculty || isPlaceholderFaculty(member.faculty),
  },
  {
    name: "email",
    label: "E-pošta",
    hint: "Brez nje član ne prejme nobenega obvestila kluba.",
    isMissing: (member) => !member.email,
  },
  {
    name: "phone",
    label: "Telefonska številka",
    isMissing: (member) => !member.phone,
  },
  {
    name: "address",
    label: "Ulica in hišna številka",
    isMissing: (member) => !member.address,
  },
  {
    name: "postal_code",
    label: "Poštna številka",
    isMissing: (member) => !member.postal_code,
  },
  { name: "city", label: "Kraj", isMissing: (member) => !member.city },
  {
    name: "joined_at",
    label: "Datum včlanitve",
    hint: "Kdaj je član prvič pristopil, ne datum podaljšanja.",
    isMissing: (member) => !member.joined_at,
  },
];

/** Imena vseh polj, ki jih obrazec za podaljšanje sme zapisati. */
export const renewableFieldNames = trackedFields.map((field) => field.name);

export function getMissingMemberFields(member: Member): MissingMemberField[] {
  return trackedFields
    .filter((field) => field.isMissing(member))
    .map(({ name, label, hint }) => ({ name, label, hint }));
}

/**
 * Ali članstvo čaka na podaljšanje.
 *
 * Dvoje šteje: član brez statusa "aktiven" in član, čigar leto članstva zaostaja
 * za tekočim. Drugo je pogostejše - član ostane "aktiven", a mu je članstvo za
 * novo šolsko leto vseeno poteklo.
 */
export function needsRenewal(member: Member, now: Date = new Date()) {
  if (member.membership_status !== "active") {
    return true;
  }

  return (member.membership_year ?? 0) < getCurrentMembershipYear(now);
}
