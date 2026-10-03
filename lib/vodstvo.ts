import { nadzorniOdbor, upravniOdbor } from "@/lib/klub";
import { createSupabasePublicClient } from "@/lib/supabase/public";

/**
 * Vodstvo kluba za javno stran.
 *
 * Ureja se v Požiralniku (Spletna stran -> Vodstvo). Če baza ni dosegljiva,
 * pokažemo seznam iz lib/klub.ts, da stran ne ostane prazna - je pa lahko
 * zastarel.
 */

export type ClanVodstva = {
  ime: string;
  funkcija: string | null;
  email: string | null;
};

export type Vodstvo = {
  upravni: ClanVodstva[];
  nadzorni: ClanVodstva[];
};

const rezervno: Vodstvo = {
  upravni: upravniOdbor.map((clan) => ({
    ime: clan.ime,
    funkcija: clan.funkcija,
    email: "email" in clan ? clan.email : null,
  })),
  nadzorni: nadzorniOdbor.map((clan) => ({ ime: clan.ime, funkcija: null, email: null })),
};

export async function pridobiVodstvo(): Promise<Vodstvo> {
  const supabase = createSupabasePublicClient();
  if (!supabase) return rezervno;

  const { data, error } = await supabase
    .from("leadership")
    .select("body, name, role, email, position")
    .order("position", { ascending: true });

  if (error || !data) {
    console.error("Napaka pri branju vodstva", error);
    return rezervno;
  }

  const vClana = (vrstica: (typeof data)[number]): ClanVodstva => ({
    ime: vrstica.name,
    funkcija: vrstica.role,
    email: vrstica.email,
  });

  return {
    upravni: data.filter((vrstica) => vrstica.body === "upravni").map(vClana),
    nadzorni: data.filter((vrstica) => vrstica.body === "nadzorni").map(vClana),
  };
}

/** Kontaktna oseba za stran Kontakt: predsednik_ca, sicer prvi v odboru. */
export function predsednikVodstva(vodstvo: Vodstvo) {
  return (
    vodstvo.upravni.find((clan) => /predsedni/i.test(clan.funkcija ?? "") && !/pod/i.test(clan.funkcija ?? "")) ??
    vodstvo.upravni[0] ??
    null
  );
}
