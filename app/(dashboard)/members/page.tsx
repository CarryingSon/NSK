import Link from "next/link";
import { Search, Users } from "lucide-react";

import { DeleteMemberButton } from "@/components/members/delete-member-button";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { membershipStatusOptions } from "@/lib/constants";
import { getMembers } from "@/lib/data";
import { formatDate, getMemberFullName } from "@/lib/format";
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
              "h-12 rounded-2xl px-6 text-base font-semibold shadow-lg shadow-primary/20",
            )}
          >
            Dodaj člana
          </Link>
        }
      />

      <section className="surface-glass rounded-[2rem] border border-white/60 p-6">
        <form method="GET" className="grid gap-4 lg:grid-cols-[1fr_220px_120px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              name="query"
              defaultValue={query}
              placeholder="Išči po imenu, priimku, fakulteti, emailu ali telefonu"
              className="h-12 rounded-2xl bg-white/80 pl-11 pr-4 shadow-sm"
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
              "h-12 rounded-2xl text-base font-semibold shadow-lg shadow-primary/20",
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
        <section className="surface-glass overflow-hidden rounded-[2rem] border border-white/60">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow className="border-white/60">
                <TableHead className="px-6 py-4">Član</TableHead>
                <TableHead className="px-6 py-4">Fakulteta</TableHead>
                <TableHead className="px-6 py-4">Kontakt</TableHead>
                <TableHead className="px-6 py-4">Status</TableHead>
                <TableHead className="px-6 py-4">Članstvo</TableHead>
                <TableHead className="px-6 py-4 text-right">Akcije</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.id} className="border-white/50">
                  <TableCell className="px-6 py-4">
                    <div>
                      <p className="font-semibold text-foreground">
                        {getMemberFullName(member)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {member.city || "Brez mesta"}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-sm text-muted-foreground">
                    {member.faculty || "Ni podatka"}
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <div>
                      <p>{member.email || "Ni e-pošte"}</p>
                      <p className="text-sm text-muted-foreground">
                        {member.phone || "Ni telefona"}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <StatusBadge status={member.membership_status} />
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <div>
                      <p>{member.membership_year || "Ni leta članstva"}</p>
                      <p className="text-sm text-muted-foreground">
                        Včlanjen: {formatDate(member.joined_at)}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <div className="flex justify-end gap-3">
                      <Link
                        href={`/members/${member.id}`}
                        className={cn(
                          buttonVariants({ variant: "outline", size: "sm" }),
                          "rounded-2xl",
                        )}
                      >
                        Preglej
                      </Link>
                      <Link
                        href={`/members/${member.id}/edit`}
                        className={cn(
                          buttonVariants({ variant: "ghost", size: "sm" }),
                          "rounded-2xl",
                        )}
                      >
                        Uredi
                      </Link>
                      <DeleteMemberButton
                        id={member.id}
                        fullName={getMemberFullName(member)}
                        returnTo="/members"
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </section>
      )}
    </div>
  );
}
