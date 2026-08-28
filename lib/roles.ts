export type AppRole = "admin" | "officer";

export const appRoles: AppRole[] = ["admin", "officer"];

export const appRoleLabels: Record<AppRole, string> = {
  admin: "Administrator",
  officer: "Uradnik",
};

export const appRoleDescriptions: Record<AppRole, string> = {
  admin: "Vidi in ureja vse: člane, prijave, evidenco tiska, obveščanje, nastavitve in uporabnike.",
  officer: "Vidi člane in evidenco tiska. Do obveščanja, prijav in nastavitev nima dostopa.",
};

// Kar ni našteto, je pridržano administratorju. Nove strani so tako privzeto
// zaprte - pozabljen vnos ne odpre dostopa, ampak ga zapre.
const officerPaths = ["/members", "/print-records", "/info"];

/**
 * Ali sme vloga odpreti pot.
 *
 * Preverja tudi podpoti, ker ima /members otroke (/members/new, /members/[id]).
 */
export function canAccessPath(role: AppRole, pathname: string) {
  if (role === "admin") {
    return true;
  }

  return officerPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

// Kam uporabnika pripelje prijava in korenska pot. Uradnik nadzorne plošče ne
// vidi, zato bi ga privzeta /dashboard takoj odbila nazaj.
export function getLandingPath(role: AppRole) {
  return role === "admin" ? "/dashboard" : "/members";
}

export function isAppRole(value: unknown): value is AppRole {
  return value === "admin" || value === "officer";
}
