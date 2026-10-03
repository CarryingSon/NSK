import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

/**
 * Odjemalec za javno stran: anonimen in brez piškotkov.
 *
 * Brez piškotkov strani ostanejo statične; osvežijo se, ko akcija v
 * Požiralniku pokliče revalidatePath(). Brez nastavljene baze vrne null.
 */
export function createSupabasePublicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) return null;

  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
