"use client";

import { useActionState, useRef, useState } from "react";
import { ImageUp, Loader2, Trash2 } from "lucide-react";

import { saveArticleAction } from "@/app/actions/articles";
import { RichTextEditor } from "@/components/notifications/rich-text-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { articleImageUrl, uploadArticleImage } from "@/lib/clanki";
import type { ActionState, Article } from "@/types/app";

const initialState: ActionState = {};

async function uploadInline(file: File) {
  const { url } = await uploadArticleImage(file);
  return url;
}

export function ArticleForm({ article }: { article?: Article | null }) {
  const [state, formAction, pending] = useActionState(
    saveArticleAction,
    initialState,
  );
  const [coverPath, setCoverPath] = useState(article?.cover_path ?? "");
  const [coverUploading, setCoverUploading] = useState(false);
  const [coverError, setCoverError] = useState<string | null>(null);
  const coverInput = useRef<HTMLInputElement>(null);

  const isPublished = article?.status === "published";
  const sectionClass = "surface-muted rounded-[18px] p-6 sm:p-8";

  async function uploadCover(file: File) {
    setCoverUploading(true);
    setCoverError(null);

    try {
      const { path } = await uploadArticleImage(file);
      setCoverPath(path);
    } catch (error) {
      setCoverError(
        error instanceof Error ? error.message : "Slike ni bilo mogoče naložiti.",
      );
    } finally {
      setCoverUploading(false);
    }
  }

  return (
    <form action={formAction} className="space-y-8">
      {article ? <input type="hidden" name="id" value={article.id} /> : null}
      <input type="hidden" name="cover_path" value={coverPath} />

      <div className={sectionClass}>
        <div className="grid gap-5">
          <div className="space-y-2">
            <Label htmlFor="title">Naslov</Label>
            <Input
              id="title"
              name="title"
              defaultValue={article?.title ?? ""}
              placeholder="npr. Brucovanje 2026"
              required
              maxLength={160}
              className="h-12 text-base"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="excerpt">Kratek povzetek (neobvezno)</Label>
            <Textarea
              id="excerpt"
              name="excerpt"
              defaultValue={article?.excerpt ?? ""}
              rows={2}
              maxLength={300}
              placeholder="Ena ali dve povedi za seznam novic. Če ostane prazno, se vzame začetek besedila."
              className="min-h-20"
            />
          </div>
        </div>
      </div>

      <div className={sectionClass}>
        <h2 className="font-heading text-xl font-semibold text-foreground">
          Naslovna slika
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Prikaže se na seznamu novic in na vrhu članka. Najlepše je ležeča
          (16 : 10), JPG, PNG ali WebP do 5 MB.
        </p>

        <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-start">
          {coverPath ? (
            // Predogled iz shrambe; next/image tu ni potreben.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={articleImageUrl(coverPath)}
              alt=""
              className="aspect-[16/10] w-full max-w-sm rounded-xl bg-muted object-cover"
            />
          ) : (
            <div className="flex aspect-[16/10] w-full max-w-sm items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted-foreground">
              Ni slike
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={coverUploading}
              onClick={() => coverInput.current?.click()}
            >
              {coverUploading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <ImageUp className="size-4" />
              )}
              {coverPath ? "Zamenjaj sliko" : "Naloži sliko"}
            </Button>
            {coverPath ? (
              <Button type="button" variant="ghost" onClick={() => setCoverPath("")}>
                <Trash2 className="size-4" />
                Odstrani
              </Button>
            ) : null}
            <input
              ref={coverInput}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = "";
                if (file) void uploadCover(file);
              }}
            />
          </div>
        </div>
        {coverError ? (
          <p className="mt-3 text-sm text-destructive">{coverError}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label>Besedilo</Label>
        <RichTextEditor
          name="content_html"
          defaultValue={article?.content_html ?? ""}
          onUploadImage={uploadInline}
          label="Besedilo članka"
          placeholder="Napiši članek. V orodni vrstici so naslovi, seznami, povezave in slike."
        />
      </div>

      <CtaFields article={article} />

      {state.error ? (
        <div
          aria-live="polite"
          className="rounded-xl border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {state.error}
        </div>
      ) : null}
      {state.success ? (
        <div
          aria-live="polite"
          className="rounded-xl border border-success/25 bg-success/10 px-4 py-3 text-sm text-success"
        >
          {state.success}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="submit"
          name="intent"
          value="publish"
          size="lg"
          disabled={pending || coverUploading}
          className="h-12 px-7 text-base font-semibold"
        >
          {pending ? <Loader2 className="size-4 animate-spin" /> : null}
          {isPublished ? "Shrani spremembe" : "Objavi"}
        </Button>
        <Button
          type="submit"
          name="intent"
          value="draft"
          size="lg"
          variant="outline"
          disabled={pending || coverUploading}
          className="h-12 px-6"
        >
          {isPublished ? "Umakni z objave" : "Shrani osnutek"}
        </Button>
      </div>
    </form>
  );
}

// Bližnjice za najpogostejše gumbe. Pot brez domene ostane veljavna tudi po
// preklopu strani na nsk-klub.si.
const ctaPresets = [
  { label: "Včlani se", url: "/pridruzi-se", name: "Prijavnica za člane" },
  { label: "Poglej ugodnosti", url: "/ugodnosti", name: "Ugodnosti" },
];

function CtaFields({ article }: { article?: Article | null }) {
  const [label, setLabel] = useState(article?.cta_label ?? "");
  const [url, setUrl] = useState(article?.cta_url ?? "");

  return (
    <div className="surface-muted rounded-[18px] p-6 sm:p-8">
      <h2 className="font-heading text-xl font-semibold text-foreground">
        Gumb na koncu članka (neobvezno)
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Npr. povezava na prijavnico ali na obrazec za prijavo na dogodek. Če
        ostane prazno, gumba ni.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {ctaPresets.map((preset) => (
          <Button
            key={preset.url}
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setLabel(preset.label);
              setUrl(preset.url);
            }}
          >
            {preset.name}
          </Button>
        ))}
        {label || url ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setLabel("");
              setUrl("");
            }}
          >
            Brez gumba
          </Button>
        ) : null}
      </div>

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="cta_label">Besedilo gumba</Label>
          <Input
            id="cta_label"
            name="cta_label"
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            maxLength={40}
            placeholder="npr. Prijavi se"
            className="h-12"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cta_url">Povezava</Label>
          <Input
            id="cta_url"
            name="cta_url"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="/pridruzi-se ali https://forms.gle/..."
            className="h-12"
          />
        </div>
      </div>
    </div>
  );
}
