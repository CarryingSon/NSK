import Link from "next/link";
import { FileText, Lock, Printer } from "lucide-react";

import { AddMemberCopies } from "@/components/print-records/add-member-copies";
import { PrintMembersTable } from "@/components/print-records/print-members-table";
import { getMembersForSelect, getPrintMonths, getPrintOverview } from "@/lib/data";
import { cn } from "@/lib/utils";

interface PrintRecordsPageProps {
  searchParams: Promise<{ month?: string }>;
}

export default async function PrintRecordsPage({
  searchParams,
}: PrintRecordsPageProps) {
  const { month } = await searchParams;
  const [overview, members, months] = await Promise.all([
    getPrintOverview(month),
    getMembersForSelect(),
    getPrintMonths(),
  ]);

  const cards = [
    {
      label: "Skupaj kopij",
      value: overview.totalUsed,
      hint: overview.monthLabel,
      tone: "text-foreground",
    },
    {
      label: "Preostale kopije",
      value: overview.totalRemaining,
      hint: `Od ${overview.totalQuota} skupaj (${overview.totalMembers} × ${overview.quota})`,
      tone: overview.totalRemaining < 0 ? "text-destructive" : "text-success",
    },
    {
      label: "Članov kopiralo",
      value: overview.membersCopied,
      hint: `Kvota: ${overview.quota} kopij/član`,
      tone: "text-foreground",
    },
  ];

  const reports = months.filter((m) => !m.isCurrent);

  return (
    <div className="space-y-8">
      <div className="mb-2 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-[14px] bg-primary/10 text-primary">
            <Printer className="size-6" />
          </span>
          <div>
            <h1 className="display-lg text-foreground">Evidenca tiska</h1>
            <p className="mt-2 text-[1.0625rem] text-muted-foreground">
              Sledenje porabe kopij in tiskov
            </p>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          {months.slice(0, 4).map((m) => (
            <Link
              key={m.param}
              href={`/print-records?month=${m.param}`}
              className={cn(
                "rounded-full px-4 py-2 text-[0.9375rem] font-medium transition-colors",
                m.param === overview.monthParam
                  ? "bg-primary text-primary-foreground"
                  : "surface-card text-muted-foreground hover:text-foreground",
              )}
            >
              {m.label}
            </Link>
          ))}
        </div>
      </div>

      {overview.readOnly ? (
        <div className="flex items-center gap-3 rounded-[14px] border border-border bg-muted px-5 py-4">
          <Lock className="size-4 shrink-0 text-muted-foreground" />
          <p className="text-[0.9375rem] text-muted-foreground">
            <strong className="font-medium text-foreground">
              Poročilo za {overview.monthLabel}.
            </strong>{" "}
            Pretekli meseci so zaklenjeni — kopij za nazaj ni mogoče vpisovati
            ali popravljati.
          </p>
        </div>
      ) : null}

      <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <div key={card.label} className="surface-card rounded-[18px] p-6">
            <p className="text-[0.9375rem] text-muted-foreground">{card.label}</p>
            <p
              className={cn(
                "mt-3 font-heading text-5xl font-semibold tabular-nums",
                card.tone,
              )}
            >
              {card.value}
            </p>
            <p className="mt-2 text-[0.875rem] text-muted-foreground">
              {card.hint}
            </p>
          </div>
        ))}
      </section>

      {overview.readOnly ? null : (
        <div className="flex justify-end">
          <AddMemberCopies members={members} />
        </div>
      )}

      <PrintMembersTable
        rows={overview.rows}
        monthParam={overview.monthParam}
        monthLabel={overview.monthLabel}
        readOnly={overview.readOnly}
      />

      {reports.length > 0 ? (
        <section className="surface-card overflow-hidden rounded-[18px]">
          <div className="border-b border-border p-6">
            <h2 className="font-heading text-2xl font-semibold tracking-[-0.02em]">
              Mesečna poročila
            </h2>
            <p className="mt-2 text-[0.9375rem] text-muted-foreground">
              Zaključeni meseci. Klik odpre enak pregled, samo brez urejanja.
            </p>
          </div>

          <ul>
            {reports.map((report) => (
              <li key={report.param} className="border-b border-border last:border-0">
                <Link
                  href={`/print-records?month=${report.param}`}
                  className="flex items-center justify-between gap-4 px-6 py-4 transition-colors hover:bg-accent"
                >
                  <span className="flex items-center gap-3">
                    <FileText className="size-4 shrink-0 text-muted-foreground" />
                    <span className="font-medium">{report.label}</span>
                  </span>
                  <span className="text-[0.9375rem] text-muted-foreground">
                    <strong className="font-semibold tabular-nums text-foreground">
                      {report.totalCopies}
                    </strong>{" "}
                    kopij · {report.membersCopied}{" "}
                    {report.membersCopied === 1 ? "član" : "članov"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
