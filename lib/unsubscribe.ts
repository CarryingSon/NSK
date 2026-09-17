import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSiteUrl } from "@/lib/site-url";

/**
 * Odjava od obveščanja.
 *
 * Povezava iz e-pošte mora delovati brez prijave, zato jo namesto gesla varuje
 * žeton: naključen UUID, vezan na natanko enega člana. Kdor ga nima, ne more
 * odjaviti nikogar, ker je edini vstopni podatek.
 *
 * Ker klicatelj nima seje, poizvedbe tečejo prek service_role odjemalca - RLS
 * na members dovoli samo prijavljene. Vsaka funkcija tu zato dela izključno nad
 * vrstico, ki se ujema z žetonom, in nikoli nad širšim naborom.
 */

/** Stran, na kateri član potrdi odjavo. Ta naslov gre v nogo sporočila. */
export function buildUnsubscribeUrl(token: string) {
  return `${getSiteUrl()}/odjava/${token}`;
}

/**
 * Naslov za glavo List-Unsubscribe.
 *
 * Poštni odjemalci (Gmail, Apple Mail) nanj pošljejo POST brez potrditve, zato
 * je ločen od strani zgoraj - stran je za človeka, ta naslov za program.
 */
export function buildUnsubscribePostUrl(token: string) {
  return `${getSiteUrl()}/api/odjava/${token}`;
}

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUnsubscribeToken(value: string) {
  return uuidPattern.test(value);
}

export interface UnsubscribeMember {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  notifications_opt_out: boolean;
}

export async function findMemberByToken(
  token: string,
): Promise<UnsubscribeMember | null> {
  if (!isUnsubscribeToken(token)) {
    return null;
  }

  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("members")
    .select("id, first_name, last_name, email, notifications_opt_out")
    .eq("notifications_token", token)
    .maybeSingle();

  if (error) {
    console.error("Napaka pri iskanju člana za odjavo", error);
    return null;
  }

  return data;
}

/**
 * Odjavi člana. Idempotentno: že odjavljen član ostane odjavljen in čas prve
 * odjave se ne prepiše.
 */
export async function optOutByToken(token: string) {
  const member = await findMemberByToken(token);

  if (!member) {
    return { ok: false as const };
  }

  if (member.notifications_opt_out) {
    return { ok: true as const, member };
  }

  const supabase = createSupabaseAdminClient();

  const { error } = await supabase
    .from("members")
    .update({
      notifications_opt_out: true,
      notifications_opt_out_at: new Date().toISOString(),
    })
    .eq("notifications_token", token);

  if (error) {
    console.error("Napaka pri odjavi od obveščanja", error);
    return { ok: false as const };
  }

  return { ok: true as const, member };
}

/** Vrnitev med prejemnike, če se je član odjavil pomotoma. */
export async function optInByToken(token: string) {
  const member = await findMemberByToken(token);

  if (!member) {
    return { ok: false as const };
  }

  const supabase = createSupabaseAdminClient();

  const { error } = await supabase
    .from("members")
    .update({
      notifications_opt_out: false,
      notifications_opt_out_at: null,
    })
    .eq("notifications_token", token);

  if (error) {
    console.error("Napaka pri vrnitvi med prejemnike", error);
    return { ok: false as const };
  }

  return { ok: true as const, member };
}
