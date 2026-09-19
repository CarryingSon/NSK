import Link from "next/link";
import { Pencil } from "lucide-react";

import { DeleteMemberButton } from "@/components/members/delete-member-button";
import { RenewMembershipButton } from "@/components/members/renew-membership-button";
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
import { formatDate, getMemberFullName, pluralize } from "@/lib/format";
import {
  formatMembershipYear,
  getMissingMemberFields,
  needsRenewal,
} from "@/lib/membership";
import { cn } from "@/lib/utils";
import type { Member } from "@/types/app";

/**
 * Seznam članov, ki se prilagodi razpoložljivi širini.
 *
 * Vrstica nosi šest podatkov in tri gumbe. To je za tabelo preveč, brž ko je
 * prostora malo, zato ima seznam tri stopnje in v nobeni ne zahteva vodoravnega
 * drsenja:
 *
 *   do  576 px  kartice - tabela bi bila ožja od gumbov v njej
 *   do 1024 px  tabela s tremi stolpci; fakulteta, kontakt in status stojijo
 *               pri imenu
 *   nad        polna tabela s šestimi stolpci
 *
 * Merimo širino vsebine (@container), ne zaslona. Pri 1024 pikslih se namreč
 * pojavi stranska vrstica in vsebina se zoži na manj, kot je imela pri 1023 -
 * meja po širini zaslona bi širšo tabelo vklopila prav takrat, ko je prostora
 * najmanj.
 */

const missingFieldForms: [string, string, string, string] = [
  "polje",
  "polji",
  "polja",
  "polj",
];

function MemberNameLink({ member }: { member: Member }) {
  return (
    // Odkar v vrstici ni več gumba "Preglej", je ime edina pot do strani o članu.
    <Link
      href={`/members/${member.id}`}
      className="font-semibold text-foreground underline-offset-4 hover:text-primary hover:underline"
    >
      {getMemberFullName(member)}
    </Link>
  );
}

function MissingFieldsNote({
  count,
  className,
}: {
  count: number;
  className?: string;
}) {
  if (count === 0) return null;

  return (
    <p className={cn("text-sm text-warning", className)}>
      Nepopolno: {count} {pluralize(count, missingFieldForms)}
    </p>
  );
}

function MemberActions({
  member,
  targetYear,
  renewalDue,
  className,
}: {
  member: Member;
  targetYear: number;
  renewalDue: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-end gap-2", className)}>
      {renewalDue ? (
        <RenewMembershipButton
          id={member.id}
          targetYear={targetYear}
          returnTo="/members"
          // Pri kartici potisne ikoni na desni rob, v tabeli ne stori nič.
          className="mr-auto"
        />
      ) : null}
      <Link
        href={`/members/${member.id}/edit`}
        aria-label={`Uredi člana ${getMemberFullName(member)}`}
        title="Uredi"
        className={cn(
          buttonVariants({ variant: "outline", size: "icon" }),
          "rounded-md",
        )}
      >
        <Pencil className="size-4" />
      </Link>
      <DeleteMemberButton
        id={member.id}
        fullName={getMemberFullName(member)}
        returnTo="/members"
        iconOnly
      />
    </div>
  );
}

/** Kraj in šola v eni vrstici; če manjka oboje, se vrstica ne prikaže prazna. */
function memberOrigin(member: Member) {
  return [member.city, member.faculty].filter(Boolean).join(" · ") || "Ni podatka";
}

/** Vrstica "oznaka - vrednost" v kartici. */
function CardRow({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="min-w-0 truncate" title={value}>
        {value}
      </dd>
    </>
  );
}

interface MemberRow {
  member: Member;
  missingCount: number;
  renewalDue: boolean;
}

function MemberCard({ row, targetYear }: { row: MemberRow; targetYear: number }) {
  const { member, missingCount, renewalDue } = row;

  return (
    <li className="surface-card rounded-[18px] border border-border p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <MemberNameLink member={member} />
          <p className="truncate text-sm text-muted-foreground">
            {memberOrigin(member)}
          </p>
        </div>
        <StatusBadge status={member.membership_status} />
      </div>

      <dl className="mt-3 grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1 text-sm">
        <CardRow label="E-pošta" value={member.email || "Ni e-pošte"} />
        <CardRow label="Telefon" value={member.phone || "Ni telefona"} />
        <CardRow
          label="Članstvo"
          value={
            member.membership_year
              ? formatMembershipYear(member.membership_year)
              : "Ni leta članstva"
          }
        />
        <CardRow label="Včlanjen" value={formatDate(member.joined_at)} />
      </dl>

      <MissingFieldsNote count={missingCount} className="mt-2" />

      <MemberActions
        member={member}
        targetYear={targetYear}
        renewalDue={renewalDue}
        className="mt-4 border-t border-border pt-4"
      />
    </li>
  );
}

export function MemberList({
  members,
  targetYear,
}: {
  members: Member[];
  targetYear: number;
}) {
  const rows: MemberRow[] = members.map((member) => ({
    member,
    missingCount: getMissingMemberFields(member).length,
    renewalDue: needsRenewal(member),
  }));

  return (
    <div className="@container">
      {/* Navpičen flex in ne grid: implicitni stolpec mreže se pri ozkem
          zaslonu razteza po najširši vsebini in kartice potisne čez rob,
          medtem ko je stolpec flexa vezan na širino vsebnika. */}
      <ul className="flex flex-col gap-3 @xl:hidden">
        {rows.map((row) => (
          <MemberCard key={row.member.id} row={row} targetYear={targetYear} />
        ))}
      </ul>

      <section className="surface-card hidden overflow-hidden rounded-[18px] border border-border @xl:block">
        {/*
          "table-fixed" da stolpcem širine vnaprej, namesto da jih razpne
          najdaljša vsebina - brez tega en sam dolg e-poštni naslov razširi
          tabelo čez okvir. Ozki stolpci dobijo toliko pikslov, kolikor jih
          vsebina res potrebuje, preostanek pa si razdelita stolpca z besedilom,
          ki se sme prelomiti ali odrezati.
        */}
        <Table className="table-fixed">
          <TableHeader>
            <TableRow className="border-border">
              <TableHead className="px-4 py-4">Član</TableHead>
              <TableHead className="hidden w-[150px] px-4 py-4 @5xl:table-cell">
                Fakulteta
              </TableHead>
              <TableHead className="hidden px-4 py-4 @5xl:table-cell">
                Kontakt
              </TableHead>
              <TableHead className="hidden w-[128px] px-4 py-4 @5xl:table-cell">
                Status
              </TableHead>
              <TableHead className="w-[152px] px-4 py-4">Članstvo</TableHead>
              <TableHead className="w-[216px] py-4 pl-2 pr-4 text-right">
                Akcije
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map(({ member, missingCount, renewalDue }) => (
              <TableRow key={member.id} className="border-border">
                <TableCell className="px-4 py-4 align-top whitespace-normal">
                  {/* Pod 1024 px podatki iz skritih stolpcev pristanejo tu, da
                      se ne izgubijo. Ko je stolpec Član dovolj širok, stojijo
                      ob imenu namesto pod njim - sicer bi desna polovica
                      celice ostala prazna. */}
                  <div className="grid gap-x-6 gap-y-1 @3xl:grid-cols-2 @5xl:grid-cols-1">
                    <div className="min-w-0">
                      {/* Pri ozkem stolpcu se prelomi ime, ne značka - sicer
                          ta pade v svojo vrstico in vrstice postanejo
                          neenakomerno visoke. */}
                      <div className="flex items-start gap-2">
                        <span className="min-w-0">
                          <MemberNameLink member={member} />
                        </span>
                        <span className="shrink-0 @5xl:hidden">
                          <StatusBadge status={member.membership_status} />
                        </span>
                      </div>
                      <p className="truncate text-sm text-muted-foreground">
                        {member.city || "Brez mesta"}
                      </p>
                    </div>
                    <div className="min-w-0 text-sm text-muted-foreground @5xl:hidden">
                      <p className="truncate">{member.faculty || "Ni podatka"}</p>
                      <p className="truncate" title={member.email ?? undefined}>
                        {member.email || "Ni e-pošte"}
                      </p>
                      <p className="truncate">{member.phone || "Ni telefona"}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden px-4 py-4 align-top text-sm whitespace-normal text-muted-foreground @5xl:table-cell">
                  {member.faculty || "Ni podatka"}
                </TableCell>
                <TableCell className="hidden px-4 py-4 align-top @5xl:table-cell">
                  <p className="truncate" title={member.email ?? undefined}>
                    {member.email || "Ni e-pošte"}
                  </p>
                  <p className="truncate text-sm text-muted-foreground">
                    {member.phone || "Ni telefona"}
                  </p>
                </TableCell>
                <TableCell className="hidden px-4 py-4 align-top @5xl:table-cell">
                  <StatusBadge status={member.membership_status} />
                </TableCell>
                <TableCell className="px-4 py-4 align-top whitespace-normal">
                  <p className="tabular-nums">
                    {member.membership_year
                      ? formatMembershipYear(member.membership_year)
                      : "Ni leta članstva"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Včlanjen: {formatDate(member.joined_at)}
                  </p>
                  <MissingFieldsNote count={missingCount} className="mt-1" />
                </TableCell>
                <TableCell className="py-4 pl-2 pr-4 align-top">
                  <MemberActions
                    member={member}
                    targetYear={targetYear}
                    renewalDue={renewalDue}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>
    </div>
  );
}
