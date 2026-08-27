import Link from "next/link";

import { MemberForm } from "@/components/forms/member-form";
import { PageHeader } from "@/components/page-header";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NewMemberPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Nov član"
        description="Dodaj novega člana v evidenco Poziralnik."
        action={
          <Link
            href="/members"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "h-12 rounded-full px-6",
            )}
          >
            Nazaj na člane
          </Link>
        }
      />

      <section>
        <MemberForm />
      </section>
    </div>
  );
}
