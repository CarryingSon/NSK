import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarClock, Mail, MapPin, Phone } from "lucide-react";

import { DeleteMemberButton } from "@/components/members/delete-member-button";
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
import { getMemberById, getMemberRegistrationHistory } from "@/lib/data";
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  getMemberFullName,
} from "@/lib/format";
import { cn } from "@/lib/utils";

interface MemberDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function MemberDetailPage({
  params,
}: MemberDetailPageProps) {
  const { id } = await params;
  const member = await getMemberById(id);

  if (!member) {
    notFound();
  }

  const history = await getMemberRegistrationHistory(id);

  return (
    <div className="space-y-8">
      <PageHeader
        title={getMemberFullName(member)}
        description="Podroben pregled člana in zgodovine aktivnosti."
        action={
          <div className="flex gap-3">
            <Link
              href="/members"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "h-12 rounded-2xl px-6",
              )}
            >
              Nazaj na člane
            </Link>
            <Link
              href={`/members/${member.id}/edit`}
              className={cn(
                buttonVariants({ variant: "default", size: "lg" }),
                "h-12 rounded-2xl px-6 shadow-lg shadow-primary/20",
              )}
            >
              Uredi
            </Link>
            <DeleteMemberButton
              id={member.id}
              fullName={getMemberFullName(member)}
              returnTo="/members"
              variant="destructive"
              size="lg"
              className="h-12 rounded-2xl px-6"
            />
          </div>
        }
      />

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="surface-glass rounded-[2rem] border border-white/60 p-6">
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge status={member.membership_status} />
            <span className="rounded-full bg-white/75 px-3 py-1 text-sm text-muted-foreground">
              Članarina {member.membership_paid ? "plačana" : "ni plačana"}
            </span>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            <div className="rounded-[1.5rem] border border-white/70 bg-white/70 p-5">
              <p className="text-sm text-muted-foreground">Osnovni podatki</p>
              <dl className="mt-4 space-y-3 text-sm">
                <div>
                  <dt className="text-muted-foreground">Datum rojstva</dt>
                  <dd className="font-medium text-foreground">
                    {formatDate(member.birth_date)}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Datum včlanitve</dt>
                  <dd className="font-medium text-foreground">
                    {formatDate(member.joined_at)}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Leto članstva</dt>
                  <dd className="font-medium text-foreground">
                    {member.membership_year || "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Fakulteta / zavod</dt>
                  <dd className="font-medium text-foreground">
                    {member.faculty || "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Znesek članarine</dt>
                  <dd className="font-medium text-foreground">
                    {formatCurrency(member.membership_fee)}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="rounded-[1.5rem] border border-white/70 bg-white/70 p-5">
              <p className="text-sm text-muted-foreground">Kontakt</p>
              <dl className="mt-4 space-y-4 text-sm">
                <div className="flex items-center gap-3">
                  <Mail className="size-4 text-muted-foreground" />
                  <span>{member.email || "Ni e-pošte"}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="size-4 text-muted-foreground" />
                  <span>{member.phone || "Ni telefona"}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="size-4 text-muted-foreground" />
                  <span>
                    {[member.address, member.postal_code, member.city]
                      .filter(Boolean)
                      .join(", ") || "Ni naslova"}
                  </span>
                </div>
              </dl>
            </div>
          </div>

          <div className="mt-6 rounded-[1.5rem] border border-white/70 bg-white/70 p-5">
            <p className="text-sm text-muted-foreground">Opombe</p>
            <p className="mt-3 whitespace-pre-wrap text-sm text-foreground">
              {member.notes || "Ni dodatnih opomb."}
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="surface-glass rounded-[2rem] border border-white/60 p-6">
            <div className="flex items-center gap-3">
              <CalendarClock className="size-5 text-muted-foreground" />
              <h2 className="font-heading text-2xl font-semibold text-foreground">
                Sistemski podatki
              </h2>
            </div>
            <dl className="mt-5 space-y-4 text-sm">
              <div>
                <dt className="text-muted-foreground">Ustvarjeno</dt>
                <dd className="font-medium text-foreground">
                  {formatDateTime(member.created_at)}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Zadnja sprememba</dt>
                <dd className="font-medium text-foreground">
                  {formatDateTime(member.updated_at)}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-heading text-3xl font-semibold text-foreground">
          Zgodovina prijav na dogodke
        </h2>
        {history.length === 0 ? (
          <EmptyState
            icon={CalendarClock}
            title="Ni zabeleženih prijav"
            description="Ko bo član prijavljen na dogodek, se bo zgodovina prikazala tukaj."
          />
        ) : (
          <div className="surface-glass overflow-hidden rounded-[2rem] border border-white/60">
            <Table>
              <TableHeader>
                <TableRow className="border-white/60">
                  <TableHead className="px-6 py-4">Dogodek</TableHead>
                  <TableHead className="px-6 py-4">Status</TableHead>
                  <TableHead className="px-6 py-4">Prijava</TableHead>
                  <TableHead className="px-6 py-4">Opombe</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((entry) => (
                  <TableRow key={entry.id} className="border-white/50">
                    <TableCell className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-foreground">
                          {entry.event?.title || "Dogodek ni več na voljo"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {entry.event?.starts_at
                            ? formatDateTime(entry.event.starts_at)
                            : "Brez termina"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <StatusBadge status={entry.status} />
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      {formatDateTime(entry.registered_at)}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-muted-foreground">
                      {entry.notes || "—"}
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
