"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAccess } from "@/lib/auth";
import {
  articleImageBucket,
  articleImagePath,
  slugify,
} from "@/lib/clanki";
import { hasRichTextContent, sanitizeRichText } from "@/lib/email-content";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { articleSchema } from "@/lib/validation";
import type { ActionState } from "@/types/app";
import type { Database } from "@/types/database";

type ArticleUpdate = Database["public"]["Tables"]["articles"]["Update"];
type Supabase = Awaited<ReturnType<typeof createSupabaseServerClient>>;

function getStringValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

// Javna stran je statična; brez tega bi spremembo pokazala šele ob naslednji
// izdaji.
function revalidateArticles() {
  revalidatePath("/clanki");
  revalidatePath("/aktualno");
  revalidatePath("/aktualno/[slug]", "page");
  revalidatePath("/");
}

/** Prost slug: "brucovanje", nato "brucovanje-2", "brucovanje-3" ... */
async function findFreeSlug(supabase: Supabase, title: string, ownId?: string) {
  const base = slugify(title);
  const { data } = await supabase
    .from("articles")
    .select("id, slug")
    .like("slug", `${base}%`);

  const taken = new Set(
    (data ?? []).filter((row) => row.id !== ownId).map((row) => row.slug),
  );

  if (!taken.has(base)) {
    return base;
  }

  let suffix = 2;
  while (taken.has(`${base}-${suffix}`)) {
    suffix += 1;
  }

  return `${base}-${suffix}`;
}

/** Poti vseh slik članka v shrambi: naslovna in tiste v besedilu. */
function collectImagePaths(coverPath: string | null, contentHtml: string) {
  const paths = new Set<string>();

  if (coverPath) {
    paths.add(coverPath);
  }

  for (const [, src] of contentHtml.matchAll(/<img[^>]*\ssrc="([^"]+)"/gi)) {
    const path = articleImagePath(src);
    if (path) paths.add(path);
  }

  return paths;
}

/**
 * Shrani članek. Namen ("draft" ali "publish") pove gumb, s katerim je bil
 * obrazec oddan: osnutek ostane skrit, objavljen je takoj na strani.
 */
export async function saveArticleAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireAccess("/clanki");

  const parsed = articleSchema.safeParse({
    id: getStringValue(formData, "id"),
    title: getStringValue(formData, "title"),
    excerpt: getStringValue(formData, "excerpt"),
    content_html: getStringValue(formData, "content_html"),
    cover_path: getStringValue(formData, "cover_path"),
    cta_label: getStringValue(formData, "cta_label"),
    cta_url: getStringValue(formData, "cta_url"),
    intent: getStringValue(formData, "intent"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Članka ni bilo mogoče shraniti." };
  }

  const { id, title, excerpt, cover_path, cta_label, cta_url, intent } = parsed.data;
  const contentHtml = sanitizeRichText(parsed.data.content_html);

  if (intent === "publish" && !hasRichTextContent(contentHtml)) {
    return { error: "Članek brez besedila ne more biti objavljen." };
  }

  let savedId = id;

  try {
    const supabase = await createSupabaseServerClient();

    const { data: existing } = id
      ? await supabase
          .from("articles")
          .select("slug, status, published_at, cover_path, content_html")
          .eq("id", id)
          .maybeSingle()
      : { data: null };

    if (id && !existing) {
      return { error: "Članek ni bil najden. Morda ga je kdo vmes izbrisal." };
    }

    // Objavljen članek obdrži svojo povezavo, tudi če se naslov spremeni -
    // nanjo že kaže kakšna objava na Instagramu. Osnutek jo dobi iz naslova.
    const slug =
      existing?.published_at
        ? existing.slug
        : await findFreeSlug(supabase, title, id);

    const publishing = intent === "publish";
    const values: ArticleUpdate = {
      title,
      slug,
      excerpt: excerpt ?? null,
      content_html: contentHtml,
      cover_path: cover_path ?? null,
      cta_label: cta_label ?? null,
      cta_url: cta_url ?? null,
      status: publishing ? "published" : "draft",
      // Datum prve objave ostane; popravek ne potisne članka na vrh.
      published_at: publishing
        ? existing?.published_at ?? new Date().toISOString()
        : existing?.published_at ?? null,
    };

    if (id) {
      const { error } = await supabase.from("articles").update(values).eq("id", id);
      if (error) throw error;

      // Slike, ki jih članek ne uporablja več, odstranimo iz shrambe.
      const before = collectImagePaths(existing!.cover_path, existing!.content_html);
      const after = collectImagePaths(values.cover_path ?? null, contentHtml);
      const unused = [...before].filter((path) => !after.has(path));
      if (unused.length > 0) {
        await supabase.storage.from(articleImageBucket).remove(unused);
      }
    } else {
      const { data, error } = await supabase
        .from("articles")
        .insert({ ...values, title, slug, author_email: user?.email ?? null })
        .select("id")
        .single();

      if (error || !data) throw error ?? new Error("Članek ni bil ustvarjen.");
      savedId = data.id;
    }
  } catch (error) {
    console.error("Napaka pri shranjevanju članka", error);
    return { error: "Članka ni bilo mogoče shraniti. Poskusi znova." };
  }

  revalidateArticles();

  if (!id) {
    redirect(`/clanki/${savedId}`);
  }

  return {
    success:
      intent === "publish"
        ? "Shranjeno. Članek je objavljen na strani."
        : "Shranjeno kot osnutek. Na strani ni viden.",
  };
}

export async function deleteArticleAction(formData: FormData) {
  await requireAccess("/clanki");
  const id = getStringValue(formData, "id");

  if (!id) {
    return;
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data: article } = await supabase
      .from("articles")
      .select("cover_path, content_html")
      .eq("id", id)
      .maybeSingle();

    if (article) {
      const paths = [...collectImagePaths(article.cover_path, article.content_html)];
      if (paths.length > 0) {
        await supabase.storage.from(articleImageBucket).remove(paths);
      }
    }

    await supabase.from("articles").delete().eq("id", id);
  } catch (error) {
    console.error("Napaka pri brisanju članka", error);
  }

  revalidateArticles();
  redirect("/clanki");
}
