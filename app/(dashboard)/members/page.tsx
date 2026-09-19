import Link from "next/link";
import { Search, Users } from "lucide-react";

import { MemberList } from "@/components/members/member-list";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { membershipStatusOptions } from "@/lib/constants";
import { getMembers } from "@/lib/data";
import { getCurrentMembershipYear } from "@/lib/membership";
import { cn } from "@/lib/utils";

interface MembersPageProps {
  searchParams: Promise<{
    query?: string;
    status?: "active" | "inactive" | "pending" | "all";
  }>;
}

export default async function MembersPage({ searchParams }: MembersPageProps) {
  const { query = "", status = "all" } = await searchParams;
  const { members } = await getMembers({ query, status });
  // Tekoče leto članstva je za cel seznam isto, zato ga izračunamo enkrat.
  const targetYear = getCurrentMembershipYear();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Člani"
        description="Išči, filtriraj in upravljaj evidenco članov kluba."
        action={
          <Link
            href="/members/new"
            className={cn(
              buttonVariants({ variant: "default", size: "lg" }),
              "h-12 rounded-full px-6 text-base font-semibold",
            )}
          >
            Dodaj člana
          </Link>
        }
      />

      <section className="surface-card rounded-[18px] border border-border p-6">
        <form method="GET" className="grid gap-4 lg:grid-cols-[1fr_220px_120px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              name="query"
              defaultValue={query}
              placeholder="Išči po imenu, priimku, fakulteti, emailu ali telefonu"
              className="h-12 rounded-xl bg-card pl-11 pr-4"
            />
          </div>
          <NativeSelect name="status" defaultValue={status}>
            <option value="all">Vsi statusi</option>
            {membershipStatusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </NativeSelect>
          <button
            type="submit"
            className={cn(
              buttonVariants({ variant: "default", size: "lg" }),
              "h-12 rounded-full text-base font-semibold",
            )}
          >
            Filtriraj
          </button>
        </form>
      </section>

      {members.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Ni najdenih članov"
          description="Ko bo baza napolnjena, se bodo tukaj prikazali vsi člani. Poskusi spremeniti filter ali dodaj novega člana."
        />
      ) : (
        <MemberList members={members} targetYear={targetYear} />
      )}
    </div>
  );
}
