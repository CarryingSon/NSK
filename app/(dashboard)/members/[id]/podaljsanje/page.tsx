import Link from "next/link";
import { notFound } from "next/navigation";

import { RenewMembershipForm } from "@/components/members/renew-membership-form";
import { PageHeader } from "@/components/page-header";
import { buttonVariants } from "@/components/ui/button";
import { getMemberById } from "@/lib/data";
import { getMemberFullName } from "@/lib/format";
import {
  formatMembershipYear,
  getCurrentMembershipYear,
  getMissingMemberFields,
} from "@/lib/membership";
import { cn } from "@/lib/utils";

interface RenewMembershipPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ return_to?: string }>;
}

export default async function RenewMembershipPage({
  params,
  searchParams,
}: RenewMembershipPageProps) {
  const { id } = await params;
  const { return_to: returnTo } = await searchParams;
  const member = await getMemberById(id);

  if (!member) {
    notFound();
  }

  const targetYear = getCurrentMembershipYear();
  const missingFields = getMissingMemberFields(member);

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Podaljšaj: ${getMemberFullName(member)}`}
        description={`Podaljšanje članstva za šolsko leto ${formatMembershipYear(targetYear)} in dopolnitev manjkajočih podatkov.`}
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
        <RenewMembershipForm
          member={member}
          missingFields={missingFields}
          targetYear={targetYear}
          // Uradnik, ki dela po seznamu, se vrne na seznam; sicer na člana.
          returnTo={returnTo === "/members" ? "/members" : `/members/${member.id}`}
        />
      </section>
    </div>
  );
}
