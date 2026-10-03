import { SquareArrowOutUpRight } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { buttonVariants } from "@/components/ui/button";
import { LeadershipEditor } from "@/components/vodstvo/leadership-editor";
import { requireAccess } from "@/lib/auth";
import { club } from "@/lib/constants";
import { getLeadership } from "@/lib/data";
import { cn } from "@/lib/utils";

export default async function LeadershipPage() {
  await requireAccess("/vodstvo");
  const members = await getLeadership();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Vodstvo"
        description="Upravni in nadzorni odbor, kot se prikažeta na spletni strani pod O NŠK → Vodstvo. Po shranjevanju je sprememba takoj vidna."
        action={
          <a
            href={`${club.website}/o-nas/vodstvo`}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "h-12 rounded-full px-6",
            )}
          >
            <SquareArrowOutUpRight className="size-4" />
            Poglej na strani
          </a>
        }
      />
      <LeadershipEditor members={members} />
    </div>
  );
}
