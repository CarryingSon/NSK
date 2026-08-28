import Link from "next/link";
import { CalendarPlus, Clock, UserCheck, UserMinus, Users } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getDashboardOverview } from "@/lib/data";
import { formatDate, getMemberFullName } from "@/lib/format";
import { cn } from "@/lib/utils";
import { requireAdmin } from "@/lib/auth";

export default async function DashboardPage() {
  await requireAdmin();

  const overview = await getDashboardOverview();

  const stats = [
    {
      icon: UserCheck,
      label: "Aktivni člani",
      value: overview.activeMembers,
      hint: "Trenutno veljavno članstvo",
      href: "/members?status=active",
    },
    {
      icon: CalendarPlus,
      label: `Novi v letu ${overview.year}`,
      value: overview.newThisYear,
      hint: "Po datumu včlanitve",
      href: "/members",
    },
    {
      icon: UserMinus,
      label: "Neaktivni",
      value: overview.inactiveMembers,
      hint: "Članstvo je poteklo",
      href: "/members?status=inactive",
    },
    {
      icon: Clock,
      label: "V postopku",
      value: overview.pendingMembers,
      hint: "Čakajo na potrditev",
      href: "/members?status=pending",
    },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Nadzorna plošča"
        description={`Pregled članstva kluba in prirasta v letu ${overview.year}.`}
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

      <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="surface-card group rounded-[18px] border border-border p-6 transition hover:border-primary/30"
          >
            <div className="flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <stat.icon className="size-5" />
              </span>
              <p className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </p>
            </div>
            <p className="mt-5 font-heading text-5xl font-semibold text-foreground">
              {stat.value}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">{stat.hint}</p>
          </Link>
        ))}
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-heading text-2xl font-semibold text-foreground">
              Novi člani v letu {overview.year}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Vsi, ki so se včlanili od 1. januarja {overview.year}.
            </p>
          </div>
          <Link
            href="/members"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "rounded-full",
            )}
          >
            Vsi člani
          </Link>
        </div>

        {overview.newMembersThisYear.length === 0 ? (
          <EmptyState
            icon={CalendarPlus}
            title={`Letos še ni novih članov`}
            description={`Ko se bo kdo včlanil v letu ${overview.year}, se bo pojavil tukaj.`}
          />
        ) : (
          <div className="surface-card overflow-hidden rounded-[18px] border border-border">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead className="px-4 py-4">Član</TableHead>
                  <TableHead className="px-4 py-4">Fakulteta</TableHead>
                  <TableHead className="px-4 py-4">Včlanjen</TableHead>
                  <TableHead className="px-4 py-4">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {overview.newMembersThisYear.map((member) => (
                  <TableRow key={member.id} className="border-border">
                    <TableCell className="px-4 py-4">
                      <Link
                        href={`/members/${member.id}`}
                        className="font-semibold text-foreground hover:text-primary"
                      >
                        {getMemberFullName(member)}
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        {member.email || "Ni e-pošte"}
                      </p>
                    </TableCell>
                    <TableCell className="px-4 py-4 text-sm text-muted-foreground">
                      {member.faculty || "Ni podatka"}
                    </TableCell>
                    <TableCell className="px-4 py-4 text-sm">
                      {formatDate(member.joined_at)}
                    </TableCell>
                    <TableCell className="px-4 py-4">
                      <StatusBadge status={member.membership_status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-heading text-2xl font-semibold text-foreground">
              Aktivni člani
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Zadnjih {overview.recentActiveMembers.length} od skupno{" "}
              {overview.activeMembers} aktivnih.
            </p>
          </div>
          <Link
            href="/members?status=active"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "rounded-full",
            )}
          >
            Prikaži vse aktivne
          </Link>
        </div>

        {overview.recentActiveMembers.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Ni aktivnih članov"
            description="Ko bodo člani z aktivnim statusom v bazi, bodo prikazani tukaj."
          />
        ) : (
          <div className="surface-card overflow-hidden rounded-[18px] border border-border">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead className="px-4 py-4">Član</TableHead>
                  <TableHead className="px-4 py-4">Fakulteta</TableHead>
                  <TableHead className="px-4 py-4">Kontakt</TableHead>
                  <TableHead className="px-4 py-4">Leto članstva</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {overview.recentActiveMembers.map((member) => (
                  <TableRow key={member.id} className="border-border">
                    <TableCell className="px-4 py-4">
                      <Link
                        href={`/members/${member.id}`}
                        className="font-semibold text-foreground hover:text-primary"
                      >
                        {getMemberFullName(member)}
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        {member.city || "Brez mesta"}
                      </p>
                    </TableCell>
                    <TableCell className="px-4 py-4 text-sm text-muted-foreground">
                      {member.faculty || "Ni podatka"}
                    </TableCell>
                    <TableCell className="px-4 py-4 text-sm">
                      <p>{member.email || "Ni e-pošte"}</p>
                      <p className="text-muted-foreground">
                        {member.phone || "Ni telefona"}
                      </p>
                    </TableCell>
                    <TableCell className="px-4 py-4 text-sm">
                      {member.membership_year || "Ni podatka"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>
    </div>
  );
}
