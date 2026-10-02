import { createClient } from "@supabase/supabase-js";

import { articleImageUrl } from "@/lib/clanki";
import type { Database } from "@/types/database";

/**
 * Novice za javno stran.
 *
 * Članke piše klub v Požiralniku (zavihek Članki), tu pa beremo samo
 * objavljene. Odjemalec je brez piškotkov, da strani ostanejo statične;
 * osvežijo se, ko akcija v Požiralniku pokliče revalidatePath().
 */

export type Novica = {
  id: string;
  slug: string;
  naslov: string;
  vsebina: string;
  povzetek: string | null;
  slika: string | null;
  datum: string | null;
};

function odjemalec() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const kljuc = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !kljuc) return null;

  return createClient<Database>(url, kljuc, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

type Vrstica = Database["public"]["Tables"]["articles"]["Row"];

function vNovico(vrstica: Vrstica): Novica {
  return {
    id: vrstica.id,
    slug: vrstica.slug,
    naslov: vrstica.title,
    vsebina: vrstica.content_html,
    povzetek: vrstica.excerpt,
    slika: vrstica.cover_path ? articleImageUrl(vrstica.cover_path) : null,
    datum: vrstica.published_at,
  };
}

export async function pridobiNovice(stevilo = 100): Promise<Novica[]> {
  const supabase = odjemalec();
  if (!supabase) return [];

  // RLS obiskovalcu tako ali tako vrne samo objavljene; filter je tu zato, da
  // tudi prijavljen urednik na javni strani ne bi videl osnutkov.
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(stevilo);

  if (error) {
    // Izpad baze ne sme podreti naslovnice - raje brez novic.
    console.error("Napaka pri branju novic", error);
    return [];
  }

  return (data ?? []).map(vNovico);
}

export async function pridobiNovico(slug: string): Promise<Novica | null> {
  const supabase = odjemalec();
  if (!supabase) return null;

  const { data } = await supabase
    .from("articles")
    .select("*")
    .eq("status", "published")
    .eq("slug", slug)
    .maybeSingle();

  return data ? vNovico(data) : null;
}

/** Povzetek za seznam: ročno napisan ali začetek besedila. */
export function povzetekNovice(novica: Novica, dolzina = 160) {
  return novica.povzetek?.trim() || izvlecek(novica.vsebina, dolzina);
}

/** "2. oktober 2026" */
export function datumNovice(novica: Novica) {
  if (!novica.datum) return null;

  return new Intl.DateTimeFormat("sl-SI", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Ljubljana",
  }).format(new Date(novica.datum));
}

/** Besedilo objave je HTML; za izvleček ga je treba olupiti. */
export function izvlecek(vsebina: string, dolzina = 160) {
  const golo = vsebina
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (golo.length <= dolzina) return golo;
  return `${golo.slice(0, dolzina).replace(/\s+\S*$/, "")}…`;
}

/**
 * Očisti HTML objave pred izrisom.
 *
 * Besedilo je ob shranjevanju že očiščeno, a izris ne sme zaupati bazi -
 * vrstico lahko kdo spremeni tudi mimo Požiralnika. Zato obdržimo
 * samo oznake, ki jih objava potrebuje, in vse atribute razen href, src in
 * alt zavržemo - s tem odpadejo tudi on* rokovalniki in javascript: naslovi.
 */
const DOVOLJENE_OZNAKE = new Set([
  "p", "br", "strong", "b", "em", "i", "u", "ul", "ol", "li",
  "h2", "h3", "h4", "blockquote", "a", "img",
]);

export function ocistiHtml(vsebina: string) {
  return (
    vsebina
      // Cele nevarne bloke pobrišemo skupaj z vsebino.
      .replace(/<(script|style|iframe|object|embed)[\s\S]*?<\/\1>/gi, "")
      .replace(/<[^>]*>/g, (oznaka) => {
        const ujem = /^<\/?\s*([a-zA-Z0-9]+)/.exec(oznaka);
        const ime = ujem?.[1]?.toLowerCase();

        if (!ime || !DOVOLJENE_OZNAKE.has(ime)) {
          return "";
        }

        if (oznaka.startsWith("</")) {
          return `</${ime}>`;
        }

        const atributi: string[] = [];

        for (const [, kljuc, vrednost] of oznaka.matchAll(
          /([a-zA-Z-]+)\s*=\s*"([^"]*)"/g,
        )) {
          const k = kljuc.toLowerCase();
          if (k !== "href" && k !== "src" && k !== "alt") continue;
          // javascript:, data: in vbscript: naslovi odpadejo.
          if (/^\s*(javascript|data|vbscript):/i.test(vrednost)) continue;
          atributi.push(`${k}="${vrednost.replace(/"/g, "&quot;")}"`);
        }

        const rep = ime === "br" || ime === "img" ? " /" : "";
        return `<${ime}${atributi.length ? ` ${atributi.join(" ")}` : ""}${rep}>`;
      })
  );
}
