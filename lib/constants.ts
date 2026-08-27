import type { LucideIcon } from "lucide-react";
import {
  Bell,
  LayoutDashboard,
  Info,
  LogOut,
  Newspaper,
  Settings,
  Users,
} from "lucide-react";

import type { MembershipStatus } from "@/types/database";
import type { NotificationAudience, StatusOption } from "@/types/app";

export const appName = "Poziralnik";

export interface NavigationItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const primaryNavigation: NavigationItem[] = [
  { href: "/dashboard", label: "Nadzorna plošča", icon: LayoutDashboard },
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

export const notificationAudienceOptions: StatusOption<NotificationAudience>[] = [
  { value: "active", label: "Aktivni člani" },
  { value: "all", label: "Vsi člani z e-pošto" },
  { value: "inactive", label: "Neaktivni člani" },
  { value: "pending", label: "Člani v postopku" },
];

export const notificationAudienceLabels: Record<NotificationAudience, string> = {
  all: "Vsi člani z e-pošto",
  active: "Aktivni člani",
  inactive: "Neaktivni člani",
  pending: "Člani v postopku",
};

