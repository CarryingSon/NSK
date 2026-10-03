import Link from "next/link";
import { notFound } from "next/navigation";
import { SquareArrowOutUpRight } from "lucide-react";

import { ArticleForm } from "@/components/clanki/article-form";
import { DeleteArticleButton } from "@/components/clanki/delete-article-button";
import { PageHeader } from "@/components/page-header";
import { buttonVariants } from "@/components/ui/button";
import { requireAccess } from "@/lib/auth";
import { getArticle } from "@/lib/data";
import { cn } from "@/lib/utils";

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAccess("/clanki");
  const { id } = await params;
  const article = await getArticle(id);

  if (!article) {
    notFound();
  }

  const isPublished = article.status === "published";

  return (
    <div className="space-y-8">
      <PageHeader
        title={article.title}
        description={
          isPublished
            ? "Članek je objavljen. Spremembe so na strani takoj po shranjevanju."
            : "Osnutek - na strani ni viden, dokler ga ne objaviš."
        }
        action={
          <div className="flex flex-wrap gap-2">
            {isPublished ? (
              <Link
                href={`/aktualno/${article.slug}`}
                target="_blank"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "h-12 rounded-full px-6",
                )}
              >
                <SquareArrowOutUpRight className="size-4" />
                Poglej na strani
              </Link>
            ) : null}
            <DeleteArticleButton id={article.id} title={article.title} />
          </div>
        }
      />
      {/* key: po shranjevanju z drugim stanjem se obrazec izriše na novo. */}
      <ArticleForm key={`${article.id}-${article.status}`} article={article} />
    </div>
  );
}
