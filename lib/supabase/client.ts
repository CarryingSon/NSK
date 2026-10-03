import { createBrowserClient } from "@supabase/ssr";

import type { Database } from "@/types/database";

/**
 * Odjemalec v brskalniku, s sejo iz istih piškotkov kot strežnik.
 *
 * Uporablja se samo za nalaganje slik naravnost v shrambo: strežniška akcija
 * sprejme največ 1 MB, Vercel pa 4,5 MB, fotografija s telefona pa je večja.
 */
export function createSupabaseBrowserClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
