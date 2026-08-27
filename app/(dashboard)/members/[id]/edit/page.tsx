import Link from "next/link";
import { notFound } from "next/navigation";

import { MemberForm } from "@/components/forms/member-form";
import { PageHeader } from "@/components/page-header";
import { buttonVariants } from "@/components/ui/button";
import { getMemberById } from "@/lib/data";
import { getMemberFullName } from "@/lib/format";
import { cn } from "@/lib/utils";

interface EditMemberPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditMemberPage({ params }: EditMemberPageProps) {
  const { id } = await params;
  const member = await getMemberById(id);

  if (!member) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Uredi: ${getMemberFullName(member)}`}
        description="Posodobi članske podatke in shrani spremembe v evidenco."
        action={
          <Link
            href={`/members/${member.id}`}
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "h-12 rounded-full px-6",
            )}
          >
            Nazaj na pregled
          </Link>
        }
      />

      <section>
        <MemberForm member={member} />
      </section>
    </div>
  );
}
