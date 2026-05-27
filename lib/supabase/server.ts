import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { getSupabaseCredentials } from "@/lib/supabase/env";
import type { Database } from "@/types/database";

export async function createSupabaseServerClient() {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseCredentials();
  const cookieStore = await cookies();

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Setting cookies from a Server Component during render is not allowed.
        }
      },
    },
  });
}
