import { cache } from "react";
import { redirect } from "next/navigation";

import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface CurrentUser {
  id: string;
  email: string | null;
  role: string | null;
}

// getClaims() preveri podpis žetona lokalno prek JWKS (~0,4 ms), medtem ko
// getUser() za vsak klic odpotuje do Auth strežnika (~85 ms). Projekt podpisuje
// asimetrično (ES256), zato preverjanje ostane kriptografsko enakovredno.
// Kadar žeton poteče, getClaims() prek getSession() sproži osvežitev.
//
// cache() poskrbi, da se med enim renderjem kliče največ enkrat, tudi če
// identiteto potrebujeta layout in strežniška akcija hkrati.
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

  return {
    id: sub,
    email: typeof email === "string" ? email : null,
    role: typeof role === "string" ? role : null,
  };
});

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user && isSupabaseConfigured()) {
    redirect("/login");
  }

  return user;
}
