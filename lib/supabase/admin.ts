import "server-only";

import { createClient } from "@supabase/supabase-js";

import { getServiceRoleCredentials } from "@/lib/supabase/env";
import type { Database } from "@/types/database";

/**
 * Odjemalec s service_role ključem.
 *
 * Ključ obide vsa RLS pravila, zato ga sme uporabljati samo koda, ki je pred
 * tem sama preverila, da klicatelj je administrator. Nikoli ga ne uvažaj v
 * komponento z "use client" - v brskalniku bi pomenil poln dostop do baze.
 *
 * Seje ne hranimo in žetona ne osvežujemo: ključ ni vezan na uporabnika.
 */
export function createSupabaseAdminClient() {
  const { supabaseUrl, supabaseServiceRoleKey } = getServiceRoleCredentials();

  return createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
