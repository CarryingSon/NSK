import Link from "next/link";
import { Printer } from "lucide-react";

import { AddMemberCopies } from "@/components/print-records/add-member-copies";
import { PrintMembersTable } from "@/components/print-records/print-members-table";
import { getMembersForSelect, getPrintOverview } from "@/lib/data";
import { cn } from "@/lib/utils";

interface PrintRecordsPageProps {
  searchParams: Promise<{ month?: string }>;
}

export default async function PrintRecordsPage({
  searchParams,
}: PrintRecordsPageProps) {
  const { month } = await searchParams;
  const [overview, members] = await Promise.all([
    getPrintOverview(month),
    getMembersForSelect(),
  ]);

  const months = [
    { param: overview.monthParam, label: overview.monthLabel },
    { param: overview.previousParam, label: overview.previousLabel },
  ];
  const active = month ?? overview.monthParam;

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
      hint: `Od ${overview.totalQuota} skupaj`,
      tone:
        overview.totalRemaining < 0 ? "text-destructive" : "text-success",
    },
    {
      label: "Članov kopiralo",
      value: overview.membersCopied,
      hint: `Kvota: ${overview.quota} kopij/član`,
      tone: "text-foreground",
    },
  ];

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

        <div className="flex shrink-0 gap-2">
          {months.map((m) => (
            <Link
              key={m.param}
              href={`/print-records?month=${m.param}`}
              className={cn(
                "rounded-full px-4 py-2 text-[0.9375rem] font-medium transition-colors",
                m.param === active
                  ? "bg-primary text-primary-foreground"
                  : "surface-card text-muted-foreground hover:text-foreground",
              )}
            >
              {m.label}
            </Link>
          ))}
        </div>
      </div>

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

      <div className="flex justify-end">
        <AddMemberCopies members={members} />
      </div>

      <PrintMembersTable
        rows={overview.rows}
        monthParam={overview.monthParam}
        monthLabel={overview.monthLabel}
      />
    </div>
  );
}
