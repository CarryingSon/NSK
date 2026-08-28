import { cache } from "react";
import { redirect } from "next/navigation";

import { canAccessPath, isAppRole, type AppRole } from "@/lib/roles";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface CurrentUser {
  id: string;
  email: string | null;
  // Vloga iz Supabase Auth ("authenticated"), ne vloga v aplikaciji.
  authRole: string | null;
  // Vloga v aplikaciji. Uporabnik brez zapisane vloge velja za uradnika -
  // manjkajoč podatek ne sme podeliti administratorskih pravic.
  role: AppRole;
}

// getClaims() preveri podpis žetona lokalno prek JWKS (~0,4 ms), medtem ko
// getUser() za vsak klic odpotuje do Auth strežnika (~85 ms). Projekt podpisuje
// asimetrično (ES256), zato preverjanje ostane kriptografsko enakovredno.
// Kadar žeton poteče, getClaims() prek getSession() sproži osvežitev.
//
// cache() poskrbi, da se med enim renderjem kliče največ enkrat, tudi če
// identiteto potrebujeta layout in strežniška akcija hkrati.
// Zasilni izhod pred zaklepom: račun iz ADMIN_EMAIL velja za administratorja
// tudi brez zapisane vloge. Brez tega bi obstoječi račun po uvedbi vlog padel
// na "uradnik" in izgubil dostop prav do nastavitev, kjer bi si vlogo vrnil.
const bootstrapAdminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();

function resolveRole(claimRole: unknown, email: string | null): AppRole {
  if (isAppRole(claimRole)) {
    return claimRole;
  }

  if (
    bootstrapAdminEmail &&
    email &&
    email.toLowerCase() === bootstrapAdminEmail
  ) {
    return "admin";
  }

  // Manjkajoč podatek ne sme podeliti administratorskih pravic.
  return "officer";
}

export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims?.sub) {
    return null;
  }

  const { sub, email, role } = data.claims;

  // Vloga potuje v žetonu znotraj app_metadata. Piše jo lahko samo service_role
  // ključ, zato si je uporabnik ne more dvigniti sam.
  const appMetadata = data.claims.app_metadata as
    | { role?: unknown }
    | undefined;

  const resolvedEmail = typeof email === "string" ? email : null;

  return {
    id: sub,
    email: resolvedEmail,
    authRole: typeof role === "string" ? role : null,
    role: resolveRole(appMetadata?.role, resolvedEmail),
  };
});

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user && isSupabaseConfigured()) {
    redirect("/login");
  }

  return user;
}

/**
 * Zaščita strani po vlogi.
 *
 * Skrit gumb v meniju ni zaščita - do strani se pride tudi z neposrednim
 * naslovom, zato mora vsaka omejena stran to poklicati sama.
 */
export async function requireAccess(pathname: string) {
  const user = await requireUser();

  // Brez Supabase teče aplikacija v predstavitvenem načinu in vloge ni.
  if (!user) {
    return null;
  }

  if (!canAccessPath(user.role, pathname)) {
    redirect("/nimas-dostopa");
  }

  return user;
}

export async function requireAdmin() {
  const user = await requireUser();

  if (user && user.role !== "admin") {
    redirect("/nimas-dostopa");
  }

  return user;
}
