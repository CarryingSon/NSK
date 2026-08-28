import "server-only";

import { isAppRole, type AppRole } from "@/lib/roles";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isUserManagementConfigured } from "@/lib/supabase/env";

export interface AppUser {
  id: string;
  email: string;
  role: AppRole;
  // Povabljen, a gesla še ni nastavil - povabilo je smiselno poslati znova.
  invitePending: boolean;
  lastSignInAt: string | null;
  createdAt: string;
}

/**
 * Seznam uporabnikov aplikacije.
 *
 * Vir je Supabase Auth, ne lastna tabela: vloga živi v app_metadata, zato bi
 * vzporedna tabela pomenila dva vira resnice, ki se lahko razideta.
 */
export async function getAppUsers(): Promise<AppUser[]> {
  if (!isUserManagementConfigured()) {
    return [];
  }

  try {
    const admin = createSupabaseAdminClient();
    const { data, error } = await admin.auth.admin.listUsers({ perPage: 1000 });

    if (error) {
      throw error;
    }

    return (data?.users ?? [])
      .filter((user) => Boolean(user.email))
      .map((user) => {
        const role = user.app_metadata?.role;

        return {
          id: user.id,
          email: user.email ?? "",
          // Brez zapisane vloge velja nižja - manjkajoč podatek ne sme
          // podeliti administratorskih pravic.
          role: isAppRole(role) ? role : "officer",
          invitePending: Boolean(user.invited_at) && !user.last_sign_in_at,
          lastSignInAt: user.last_sign_in_at ?? null,
          createdAt: user.created_at,
        };
      })
      .sort((a, b) => a.email.localeCompare(b.email, "sl"));
  } catch (error) {
    console.error("Napaka pri nalaganju uporabnikov", error);
    return [];
  }
}
