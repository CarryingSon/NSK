import Link from "next/link";

import { ArticleForm } from "@/components/clanki/article-form";
import { PageHeader } from "@/components/page-header";
import { buttonVariants } from "@/components/ui/button";
import { requireAccess } from "@/lib/auth";
import { cn } from "@/lib/utils";

export default async function NewArticlePage() {
  await requireAccess("/clanki");

  return (
    <div className="space-y-8">
      <PageHeader
        title="Nov članek"
        description="Shrani ga kot osnutek ali ga objavi takoj."
        action={
          <Link
            href="/clanki"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "h-12 rounded-full px-6",
            )}
          >
            Nazaj na članke
          </Link>
        }
      />
      <ArticleForm />
    </div>
  );
}
