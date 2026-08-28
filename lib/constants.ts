import type { LucideIcon } from "lucide-react";
import {
  Bell,
  ClipboardList,
  History,
  LayoutDashboard,
  Info,
  LogOut,
  Newspaper,
  Settings,
  Users,
} from "lucide-react";

import type {
  ApplicationStatus,
  CampaignStatus,
  CampaignType,
  MemberSegment,
  MembershipStatus,
  NotificationAudience,
} from "@/types/database";
import type { AppRole } from "@/lib/roles";
import type { StatusOption } from "@/types/app";

export const appName = "Poziralnik";

// Podatki kluba za nogo e-pošte in stran Info. Povzeti z nsk-klub.si
// (avgust 2026); TikToka, YouTuba in LinkedIna klub na spletni strani nima,
// zato jih tu ni.
export const club = {
  name: "Notranjski študentski klub",
  shortName: "NŠK",
  street: "Gerbičeva ulica 32",
  city: "1380 Cerknica",
  email: "nsk.klub@gmail.com",
  phone: "041 301 244",
  phoneHref: "tel:+38641301244",
  // Na spletni strani je številka pripisana predsednici.
  phoneOwner: "Liza",
  officeHours: "Petek in sobota, 18:00-20:00",
  taxNumber: "96005564",
  registrationNumber: "5737877000",
  iban: "SI56 0400 0027 8210 006",
  website: "https://www.nsk-klub.si",
  links: [
    { label: "Ugodnosti", href: "https://www.nsk-klub.si/ugodnosti" },
    { label: "Aktualno", href: "https://www.nsk-klub.si/aktualno" },
    { label: "Postani član", href: "https://www.nsk-klub.si/pridruzi-se" },
  ],
  // "icon" se preslika v /public/email/<icon>.png. E-pošta potrebuje rastrsko
  // sliko na absolutnem naslovu - Gmail SVG ne prikaže.
  social: [
    {
      label: "Instagram",
      href: "https://www.instagram.com/nsk_klub/",
      icon: "instagram",
    },
    {
      label: "Facebook",
      href: "https://www.facebook.com/klub.nsk/",
      icon: "facebook",
    },
  ],
} as const;

export interface NavigationItem {
  href: string;
  label: string;
  icon: LucideIcon;
  // Katere vloge postavko vidijo. Vir resnice za dostop je canAccessPath() v
  // lib/roles.ts; tukaj je le, kaj se izriše.
  roles: AppRole[];
}

const vsi: AppRole[] = ["admin", "officer"];
const samoAdmin: AppRole[] = ["admin"];

// Delo s člani, tiskom in obveščanjem - to odpiraš vsak dan.
export const primaryNavigation: NavigationItem[] = [
  {
    href: "/dashboard",
    label: "Nadzorna plošča",
    icon: LayoutDashboard,
    roles: samoAdmin,
  },
  { href: "/members", label: "Člani", icon: Users, roles: vsi },
  {
    href: "/applications",
    label: "Prijave članov",
    icon: ClipboardList,
    roles: samoAdmin,
  },
  {
    href: "/print-records",
    label: "Evidenca tiska",
    icon: Newspaper,
    roles: vsi,
  },
  { href: "/notifications", label: "Obveščanje", icon: Bell, roles: samoAdmin },
  {
    href: "/notifications/history",
    label: "Zgodovina obvestil",
    icon: History,
    roles: samoAdmin,
  },
];

// Nastavitve in podatki kluba stojijo ob profilu na dnu: odpreš ju redko,
// zato ne zaslužita mesta med dnevnimi opravili.
export const secondaryNavigation: NavigationItem[] = [
  { href: "/settings", label: "Nastavitve", icon: Settings, roles: samoAdmin },
  { href: "/info", label: "Info", icon: Info, roles: vsi },
];

export const logoutItem = {
  label: "Odjava",
  icon: LogOut,
};

export const applicationStatusLabels: Record<ApplicationStatus, string> = {
  pending: "V obdelavi",
  approved: "Odobreno",
  rejected: "Zavrnjeno",
};

// Zavihki filtra nad seznamom prijav. "all" ni stanje prijave, zato stoji
// posebej in ne v applicationStatusLabels.
export const applicationFilters: Array<{
  value: ApplicationStatus | "all";
  label: string;
}> = [
  { value: "all", label: "Vse" },
  { value: "pending", label: "V obdelavi" },
  { value: "approved", label: "Odobrene" },
  { value: "rejected", label: "Zavrnjene" },
];

// Pot javnega obrazca. Ena konstanta, ker jo potrebujejo koda za vgradnjo,
// predogled in izjema v zaščiti poti.
export const applicationFormPath = "/vclanitev";

export interface BoardMember {
  name: string;
  role?: string;
  email?: string;
}

// Sestava organov kluba, kot je objavljena na nsk-klub.si (avgust 2026).
export const clubBoard: BoardMember[] = [
  { name: "Liza Perko", role: "Predsednica", email: "lizaperko.nsk@gmail.com" },
  { name: "Juna Jesenšek", role: "Podpredsednica" },
  { name: "Hana Jesenšek", role: "Tajnica" },
  { name: "Nikita Čuček", role: "Svetnica" },
  { name: "Luka Petavs", role: "Blagajničar" },
  { name: "Neža Horvat", role: "Predstavnica dijaške sekcije" },
];

export const clubSupervisoryBoard: BoardMember[] = [
  { name: "Miha Prudič" },
  { name: "Ambrož Puntar" },
  { name: "David Tomšič" },
];

export const clubMembership = {
  eligibility:
    "Študenti in dijaki s stalnim prebivališčem v občini Cerknica, Loška Dolina ali Bloke.",
  requirements: [
    "Originalno potrdilo o vpisu za tekoče študijsko oziroma šolsko leto",
    "Izpolnjena pristopna izjava",
    "Podpis za obdelavo osebnih podatkov",
  ],
  channels: [
    "Osebno v času uradnih ur kluba",
    "Prek spletnega obrazca na nsk-klub.si",
  ],
};

export const clubPartners = [
  "Zveza študentskih klubov Slovenije",
  "Občina Cerknica",
];

export const membershipStatusOptions: StatusOption<MembershipStatus>[] = [
  { value: "active", label: "Aktiven" },
  { value: "inactive", label: "Neaktiven" },
  { value: "pending", label: "V postopku" },
];

export interface FacultyOptionGroup {
  label: string;
  options: StatusOption<string>[];
}

function createFacultyOptionGroup(label: string, values: string[]): FacultyOptionGroup {
  return {
    label,
    options: values.map((value) => ({
      value,
      label: value,
    })),
  };
}

export const facultyOptionGroups: FacultyOptionGroup[] = [
  createFacultyOptionGroup("Univerza v Ljubljani", [
    "Akademija za glasbo (UL AG)",
    "Akademija za gledališče, radio, film in televizijo (UL AGRFT)",
    "Akademija za likovno umetnost in oblikovanje (UL ALUO)",
    "Biotehniška fakulteta (UL BF)",
    "Ekonomska fakulteta (UL EF)",
    "Fakulteta za arhitekturo (UL FA)",
    "Fakulteta za družbene vede (UL FDV)",
    "Fakulteta za elektrotehniko (UL FE)",
    "Fakulteta za farmacijo (UL FFA)",
    "Fakulteta za gradbeništvo in geodezijo (UL FGG)",
    "Fakulteta za kemijo in kemijsko tehnologijo (UL FKKT)",
    "Fakulteta za matematiko in fiziko (UL FMF)",
    "Fakulteta za pomorstvo in promet (UL FPP)",
    "Fakulteta za računalništvo in informatiko (UL FRI)",
    "Fakulteta za socialno delo (UL FSD)",
    "Fakulteta za strojništvo (UL FS)",
    "Fakulteta za šport (UL FŠ)",
    "Fakulteta za upravo (UL FU)",
    "Filozofska fakulteta (UL FF)",
    "Medicinska fakulteta (UL MF)",
    "Naravoslovnotehniška fakulteta (UL NTF)",
    "Pedagoška fakulteta (UL PEF)",
    "Pravna fakulteta (UL PF)",
    "Teološka fakulteta (UL TEOF)",
    "Veterinarska fakulteta (UL VF)",
    "Zdravstvena fakulteta (UL ZF)",
  ]),
  createFacultyOptionGroup("Univerza v Mariboru", [
    "Ekonomsko-poslovna fakulteta (UM EPF)",
    "Fakulteta za elektrotehniko, računalništvo in informatiko (UM FERI)",
    "Fakulteta za energetiko (UM FE)",
    "Fakulteta za gradbeništvo, prometno inženirstvo in arhitekturo (UM FGPA)",
    "Fakulteta za kemijo in kemijsko tehnologijo (UM FKKT)",
    "Fakulteta za kmetijstvo in biosistemske vede (UM FKBV)",
    "Fakulteta za logistiko (UM FL)",
    "Fakulteta za naravoslovje in matematiko (UM FNM)",
    "Fakulteta za organizacijske vede (UM FOV)",
    "Fakulteta za strojništvo (UM FS)",
    "Fakulteta za turizem (UM FT)",
    "Fakulteta za varnostne vede (UM FVV)",
    "Fakulteta za zdravstvene vede (UM FZV)",
    "Filozofska fakulteta (UM FF)",
    "Medicinska fakulteta (UM MF)",
    "Pedagoška fakulteta (UM PEF)",
    "Pravna fakulteta (UM PF)",
  ]),
  createFacultyOptionGroup("Univerza na Primorskem", [
    "Fakulteta za humanistične študije (UP FHŠ)",
    "Fakulteta za management (UP FM)",
    "Fakulteta za matematiko, naravoslovje in informacijske tehnologije (UP FAMNIT)",
    "Fakulteta za turistične študije – Turistica (UP FTŠ Turistica)",
    "Pedagoška fakulteta (UP PEF)",
    "Fakulteta za vede o zdravju (UP FVZ)",
  ]),
  createFacultyOptionGroup("Univerza v Novi Gorici", [
    "Akademija umetnosti (UNG AU)",
    "Fakulteta za naravoslovje (UNG FN)",
    "Fakulteta za humanistiko (UNG FH)",
    "Fakulteta za znanosti o okolju (UNG FZO)",
    "Poslovno–tehniška fakulteta (UNG PTF)",
    "Fakulteta za vinogradništvo in vinarstvo (UNG FVV)",
  ]),
  createFacultyOptionGroup("Nova univerza", [
    "NU, Evropska pravna fakulteta (NU, Evro-PF)",
    "NU, Fakulteta za državne in evropske študije (NU, FDŠ)",
  ]),
  createFacultyOptionGroup("Univerza v Novem mestu", [
    "Univerza v Novem mestu Fakulteta za ekonomijo in informatiko Novo mesto (UNM FEI)",
    "Univerza v Novem mestu Fakulteta za strojništvo (UNM FS)",
    "Univerza v Novem mestu Fakulteta za poslovne in upravne vede (UNM FPUV)",
    "Univerza v Novem mestu Fakulteta za zdravstvene vede (UNM FZV)",
  ]),
  createFacultyOptionGroup("Univerza Alma Mater Europaea", [
    "Univerza Alma Mater Europaea, Fakulteta ECM (Fakulteta ECM)",
  ]),
  createFacultyOptionGroup("Samostojni visokošolski zavodi", [
    "AREMA – Visoka šola za logistiko in management (AREMA)",
    "Fakulteta za dizajn (FD)",
    "Fakulteta za informacijske študije v Novem mestu (FIŠ)",
    "Fakulteta za tehnologijo polimerov (FTPO)",
    "Fakulteta za uporabne družbene študije v Novi Gorici (FUDŠ)",
    "Fakulteta za zdravstvene in socialne vede Slovenj Gradec (FZSV)",
    "Fakulteta za zdravstvene vede v Celju (FZV Celje)",
    "Fakulteta za zdravstvo Angele Boškin (FZAB)",
    "Gea College – Fakulteta za podjetništvo (GEA COLLEGE - FP)",
    "Mednarodna fakulteta za družbene in poslovne študije (MFDPŠ)",
    "Visoka šola na Ptuju (VŠP)",
    "Visoka šola za proizvodno inženirstvo (VŠPI)",
    "Visoka šola za upravljanje podeželja Grm Novo mesto (VŠ GRM)",
    "Fakulteta za varstvo okolja (FVO)",
  ]),
];

// Srednje šole. Seznam ni izčrpen - v Sloveniji jih je krepko čez sto - zato je
// polje v obrazcu iskalno IN dovoli prosto vnesen naziv. Tu so tiste, ki jih
// člani NŠK najpogosteje obiskujejo; dodajanje novih je zgolj vpis v ta seznam.
export const secondarySchoolOptionGroups: FacultyOptionGroup[] = [
  createFacultyOptionGroup("Notranjska in Primorska", [
    "Šolski center Postojna",
    "Gimnazija Ilirska Bistrica",
    "Gimnazija Jurija Vege Idrija",
    "Gimnazija Nova Gorica",
    "Gimnazija Koper",
    "Srednja gozdarska in lesarska šola Postojna",
  ]),
  createFacultyOptionGroup("Ljubljana", [
    "Gimnazija Bežigrad",
    "Gimnazija Poljane",
    "Gimnazija Vič",
    "Gimnazija Šentvid",
    "Gimnazija Ledina",
    "Gimnazija Jožeta Plečnika Ljubljana",
    "Gimnazija Moste",
    "Škofijska klasična gimnazija",
    "Srednja ekonomska šola Ljubljana",
    "Srednja šola za gostinstvo in turizem v Ljubljani",
    "Srednja medijska in grafična šola Ljubljana",
    "Srednja šola za farmacijo, kozmetiko in zdravstvo Ljubljana",
    "Srednja gradbena, geodetska in okoljevarstvena šola Ljubljana",
  ]),
  createFacultyOptionGroup("Gorenjska in Zasavje", [
    "Gimnazija Kranj",
    "Gimnazija Franceta Prešerna Kranj",
    "Gimnazija Škofja Loka",
    "Gimnazija Jesenice",
    "Gimnazija Domžale",
  ]),
  createFacultyOptionGroup("Štajerska, Dolenjska in Prekmurje", [
    "Prva gimnazija Maribor",
    "II. gimnazija Maribor",
    "III. gimnazija Maribor",
    "I. gimnazija v Celju",
    "Gimnazija Celje - Center",
    "Gimnazija Novo mesto",
    "Gimnazija Ptuj",
    "Gimnazija Murska Sobota",
    "Gimnazija Brežice",
  ]),
];

// Skupen seznam za izbirnik: najprej srednje šole, nato visokošolski zavodi.
export const schoolOptionGroups: FacultyOptionGroup[] = [
  ...secondarySchoolOptionGroups.map((group) => ({
    ...group,
    label: `Srednje šole - ${group.label}`,
  })),
  ...facultyOptionGroups,
];


// --- Obveščanje ---

// Polje "šola oziroma fakulteta" dovoli prosto vnesen naziv, zato skupine ne
// moremo prebrati iz stolpca. Uvrstitev zato izpeljemo iz naziva: najprej
// natančno ujemanje s seznamoma zgoraj, nato besedne značilnice. Kar se ne
// uvrsti, ostane "unknown" in je dosegljivo prek skupine "vsi člani".
const pupilSchoolNames = new Set(
  secondarySchoolOptionGroups.flatMap((group) =>
    group.options.map((option) => normalizeSchoolName(option.value)),
  ),
);

const studentSchoolNames = new Set(
  facultyOptionGroups.flatMap((group) =>
    group.options.map((option) => normalizeSchoolName(option.value)),
  ),
);

// Šumniki odpadejo, da "šolski center" ujame tudi "solski center".
function normalizeSchoolName(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

const pupilMarkers = [
  "gimnazij",
  "srednja sola",
  "srednja s",
  "srednje sole",
  "solski center",
  // Pogosti okrajšavi v prostem vnosu: "ŠC Postojna", "SŠ Josipa Jurčiča".
  "sc ",
  "ss ",
  "dijaski",
  "biotehniski izobrazevalni center",
  "izobrazevalni center",
  "poklicna sola",
  "srednja poklicna",
  "vzgojiteljska",
  "waldorfska",
];

const studentMarkers = [
  "fakultet",
  "univerz",
  "akademij",
  "visoka sola",
  "visja sola",
  "visokosolski",
  "college",
  "institut",
  "(ul ",
  "(um ",
  "(up ",
  "(ung ",
  "(unm ",
  "(nu,",
];

/**
 * Iz naziva šole izpelje skupino člana.
 *
 * Vrstni red je pomemben: "Srednja šola za farmacijo ..." nosi besedo "šola",
 * "Visoka šola za ..." pa tudi, zato dijaške značilnice preverimo prej samo pri
 * natančnem ujemanju, sicer pa je "visoka/višja šola" močnejši signal.
 */
export function classifySchool(value?: string | null): MemberSegment {
  if (!value) {
    return "unknown";
  }

  const normalized = normalizeSchoolName(value);

  if (!normalized) {
    return "unknown";
  }

  if (pupilSchoolNames.has(normalized)) {
    return "pupil";
  }

  if (studentSchoolNames.has(normalized)) {
    return "student";
  }

  // "Visoka šola" in "višja šola" sta izjemi, ki bi ju sicer ujel vzorec
  // "srednja š..." iz dijaškega seznama, zato ju preverimo najprej.
  if (normalized.includes("visoka sola") || normalized.includes("visja sola")) {
    return "student";
  }

  if (pupilMarkers.some((marker) => normalized.includes(marker))) {
    return "pupil";
  }

  if (studentMarkers.some((marker) => normalized.includes(marker))) {
    return "student";
  }

  return "unknown";
}

export const memberSegmentLabels: Record<MemberSegment, string> = {
  student: "Študenti",
  pupil: "Dijaki",
  unknown: "Neopredeljeni",
};

// Gmail SMTP dovoli 500 sporočil na dan za brezplačen račun. 450 pusti rezervo
// za prijave, opomnike in ostalo pošto kluba.
export const emailDailyLimit = 450;

// Privzeta omejitev ene kampanje. Manjša od dnevne, ker klub redko pošilja vsem
// naenkrat in je bolje, da eno obvestilo ne požre celotne kvote.
export const defaultCampaignDailyLimit = 250;

// Koliko sporočil pošljemo v eni seriji. Serverless funkcija ne sme teči predolgo,
// Gmail pa zavrne prehitre sunke - 20 sporočil je približno 20 sekund.
export const campaignBatchSize = 20;

export const notificationAudienceLabels: Record<NotificationAudience, string> = {
  all: "Vsi člani z e-pošto",
  students: "Študenti",
  pupils: "Dijaki",
  active: "Aktivni člani",
  inactive: "Neaktivni člani",
  pending: "Člani v postopku",
};

export const notificationAudienceDescriptions: Record<
  NotificationAudience,
  string
> = {
  all: "Vsak član z vpisano e-pošto, ne glede na šolo in status.",
  students: "Člani, ki obiskujejo fakulteto, akademijo ali visoko šolo.",
  pupils: "Člani, ki obiskujejo srednjo šolo ali gimnazijo.",
  active: "Člani s statusom Aktiven.",
  inactive: "Člani s statusom Neaktiven.",
  pending: "Člani s statusom V postopku.",
};

// Vrstni red v izbirniku: najprej to, kar klub pošilja najpogosteje.
export const notificationAudienceOrder: NotificationAudience[] = [
  "all",
  "students",
  "pupils",
  "active",
  "inactive",
  "pending",
];

export const campaignTypeOptions: StatusOption<CampaignType>[] = [
  { value: "obvestilo", label: "Obvestilo" },
  { value: "dogodek", label: "Dogodek" },
  { value: "ugodnost", label: "Ugodnost" },
  { value: "novice", label: "Novice" },
];

export const campaignTypeLabels: Record<CampaignType, string> = {
  obvestilo: "Obvestilo",
  dogodek: "Dogodek",
  ugodnost: "Ugodnost",
  novice: "Novice",
};

export const campaignStatusLabels: Record<CampaignStatus, string> = {
  queued: "V čakalni vrsti",
  sending: "Pošiljanje",
  paused: "Na pavzi",
  sent: "Poslano",
};
