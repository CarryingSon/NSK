/**
 * Skupno članke v Požiralniku in na javni strani.
 *
 * Datoteka nima "server-only", ker javni naslov slike potrebuje tudi obrazec v
 * brskalniku - za predogled naslovne slike.
 */

export const articleImageBucket = "clanki";
export const maxArticleImageBytes = 5 * 1024 * 1024;
export const allowedArticleImageTypes = ["image/jpeg", "image/png", "image/webp"];

/** Javni naslov slike v vedru "clanki". Vedro je javno, podpis ni potreben. */
export function articleImageUrl(path: string) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  return `${base}/storage/v1/object/public/${articleImageBucket}/${path}`;
}

/** Iz javnega naslova vrne pot v vedru, za tuje naslove null. */
export function articleImagePath(url: string) {
  const prefix = articleImageUrl("");
  return url.startsWith(prefix) ? url.slice(prefix.length) : null;
}

/**
 * Naslov članka v obliko za URL: "Brucovanje 2026!" -> "brucovanje-2026".
 * Šumnike prevedemo v osnovne črke, da je povezava berljiva tudi v e-pošti.
 */
export function slugify(title: string) {
  const slug = title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/, "");

  return slug || "clanek";
}

/**
 * Naloži sliko iz brskalnika naravnost v vedro "clanki" in vrne pot in naslov.
 * Pravila vedra (velikost, vrste, samo prijavljeni) preveri tudi Supabase.
 */
export async function uploadArticleImage(file: File) {
  if (!allowedArticleImageTypes.includes(file.type)) {
    throw new Error("Slika mora biti JPG, PNG ali WebP.");
  }

  if (file.size > maxArticleImageBytes) {
    throw new Error("Slika je večja od 5 MB. Pomanjšaj jo in poskusi znova.");
  }

  const { createSupabaseBrowserClient } = await import("@/lib/supabase/client");
  const extension =
    file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const path = `${new Date().getFullYear()}/${crypto.randomUUID()}.${extension}`;

  const { error } = await createSupabaseBrowserClient()
    .storage.from(articleImageBucket)
    .upload(path, file, { contentType: file.type, upsert: false });

  if (error) {
    throw new Error("Slike ni bilo mogoče naložiti. Poskusi znova.");
  }

  return { path, url: articleImageUrl(path) };
}
