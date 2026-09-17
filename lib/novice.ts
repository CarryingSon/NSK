/**
 * Novice za javno stran.
 *
 * Vir je zaenkrat stari GraphQL strežnik na backend.nsk-klub.si, ker tam
 * živi vseh 42 obstoječih objav. Ko se objave preselijo v Supabase, se
 * zamenja samo notranjost pridobiNovice() - klicatelji ostanejo isti.
 */

const VIR = "https://backend.nsk-klub.si/graphql";

// Objave se menjajo redko, stara stran pa ni hitra. Uro predpomnilnika stran
// razbremeni, urednik pa spremembo vidi še isti dan.
const OSVEZI_PO = 3600;

export type Novica = {
  id: number;
  naslov: string;
  vsebina: string;
  slika: string | null;
};

type GraphQLOdgovor = {
  data?: { posts?: { id: number; title: string; content: string; image: string | null }[] };
  errors?: { message: string }[];
};

// Cloudinary račun prejšnjega izvajalca. Del objav hrani celoten naslov slike,
// 34 od 39 pa le Cloudinary ime (npr. "nsk_slike/volitve_nsk"), zato je treba
// naslov sestaviti. Ob selitvi slik v Supabase Storage to odpade.
const CLOUDINARY = "https://res.cloudinary.com/vrenko007/image/upload";

function naslovSlike(slika: string | null) {
  if (!slika) return null;

  // Stari zapisi kažejo na http; brskalnik bi jih na https strani zavrnil.
  if (/^https?:\/\//.test(slika)) {
    return slika.replace(/^http:\/\//, "https://");
  }

  return `${CLOUDINARY}/${slika.replace(/^\/+/, "")}`;
}

export async function pridobiNovice(stevilo = 100): Promise<Novica[]> {
  try {
    const odgovor = await fetch(VIR, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `query Novice($page: Int!, $count: Int!) {
          posts(page: $page, count: $count) { id title content image }
        }`,
        variables: { page: 1, count: stevilo },
      }),
      next: { revalidate: OSVEZI_PO },
    });

    if (!odgovor.ok) {
      return [];
    }

    const telo = (await odgovor.json()) as GraphQLOdgovor;

    return (telo.data?.posts ?? []).map((objava) => ({
      id: objava.id,
      naslov: objava.title.trim(),
      vsebina: objava.content,
      slika: naslovSlike(objava.image),
    }));
  } catch {
    // Izpad starega strežnika ne sme podreti naslovnice - raje brez novic.
    return [];
  }
}

export async function pridobiNovico(id: number): Promise<Novica | null> {
  const novice = await pridobiNovice();
  return novice.find((novica) => novica.id === id) ?? null;
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
 * Vsebina prihaja iz starega GraphQL strežnika, ki ima odprte mutacije in ni
 * več vzdrževan (Node 16). Zato je ne izrišemo takšne, kot pride: obdržimo
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
