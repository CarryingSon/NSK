import Link from "next/link";
import { ChevronLeft, ChevronRight, Eye, Paperclip, ScrollText, Search } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
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
import { emailKindLabels } from "@/lib/constants";
import { emailLogPageSize, type EmailLogFilters } from "@/lib/data";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { EmailLogEntry } from "@/types/app";

function pageHref(filters: EmailLogFilters, page: number) {
  const params = new URLSearchParams({ tab: "dnevnik", page: String(page) });
  if (filters.kind && filters.kind !== "all") params.set("vrsta", filters.kind);
  if (filters.status && filters.status !== "all") params.set("stanje", filters.status);
  if (filters.query) params.set("q", filters.query);
  return `/notifications/history?${params.toString()}`;
}

/**
 * Dnevnik vse e-pošte, ki jo je poslala aplikacija. Filtri živijo v naslovu,
 * da se da povezavo na določen pogled deliti in osvežiti.
 */
export function EmailLog({
  rows,
  total,
  filters,
}: {
  rows: EmailLogEntry[];
  total: number;
  filters: EmailLogFilters;
}) {
  const page = filters.page ?? 1;
  const pages = Math.max(1, Math.ceil(total / emailLogPageSize));

  return (
    <section className="space-y-5">
      <form
        method="GET"
        className="surface-card grid gap-3 rounded-[18px] border border-border p-5 md:grid-cols-[1fr_220px_160px_auto]"
      >
        <input type="hidden" name="tab" value="dnevnik" />
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            name="q"
            defaultValue={filters.query ?? ""}
            placeholder="Išči po prejemniku ali zadevi"
            className="h-11 rounded-xl bg-card pl-11"
          />
        </div>
        <NativeSelect name="vrsta" defaultValue={filters.kind ?? "all"}>
          <option value="all">Vse vrste</option>
          {Object.entries(emailKindLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </NativeSelect>
        <NativeSelect name="stanje" defaultValue={filters.status ?? "all"}>
          <option value="all">Vsa stanja</option>
          <option value="sent">Poslano</option>
          <option value="failed">Neuspešno</option>
        </NativeSelect>
        <button
          type="submit"
          className={cn(buttonVariants({ size: "lg" }), "h-11 rounded-xl px-5")}
        >
          Filtriraj
        </button>
      </form>

      {rows.length === 0 ? (
        <EmptyState
          icon={ScrollText}
          title="Ni zapisov"
          description="Tu se pokaže vsaka e-pošta, ki jo pošlje aplikacija - obvestila, pozdravi, pristopne izjave in prijave napak."
        />
      ) : (
        <div className="surface-card overflow-x-auto rounded-[18px] border border-border">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow className="border-border">
                <TableHead className="px-4 py-4">Čas</TableHead>
                <TableHead className="px-4 py-4">Vrsta</TableHead>
                <TableHead className="px-4 py-4">Prejemnik</TableHead>
                <TableHead className="px-4 py-4">Zadeva</TableHead>
                <TableHead className="px-4 py-4">Stanje</TableHead>
                <TableHead className="px-4 py-4 text-right">Ogled</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id} className="border-border">
                  <TableCell className="px-4 py-3 text-sm whitespace-nowrap tabular-nums text-muted-foreground">
                    {formatDateTime(row.created_at)}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <Badge variant="secondary">{emailKindLabels[row.kind] ?? row.kind}</Badge>
                  </TableCell>
                  <TableCell className="max-w-64 px-4 py-3 text-sm">
                    <p className="truncate" title={row.to_email}>
                      {row.to_email}
                    </p>
                  </TableCell>
                  <TableCell className="max-w-80 px-4 py-3 text-sm">
                    <p className="flex items-center gap-1.5">
                      <span className="truncate" title={row.subject}>
                        {row.subject}
                      </span>
                      {row.attachments.length > 0 ? (
                        <Paperclip
                          className="size-3.5 shrink-0 text-muted-foreground"
                          aria-label={`${row.attachments.length} priponk`}
                        />
                      ) : null}
                    </p>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    {row.status === "sent" ? (
                      <Badge className="bg-success/15 text-success">Poslano</Badge>
                    ) : (
                      <Badge
                        className="bg-destructive/15 text-destructive"
                        title={row.error ?? undefined}
                      >
                        Neuspešno
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-right">
                    <Link
                      href={`/notifications/history/dnevnik/${row.id}`}
                      className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                    >
                      <Eye className="size-4" />
                      Poglej
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {total} {total === 1 ? "zapis" : "zapisov"}
        </span>
        {pages > 1 ? (
          <div className="flex items-center gap-2">
            <Link
              href={pageHref(filters, page - 1)}
              aria-disabled={page <= 1}
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                page <= 1 && "pointer-events-none opacity-40",
              )}
            >
              <ChevronLeft className="size-4" />
              Novejši
            </Link>
            <span className="tabular-nums">
              {page} / {pages}
            </span>
            <Link
              href={pageHref(filters, page + 1)}
              aria-disabled={page >= pages}
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                page >= pages && "pointer-events-none opacity-40",
              )}
            >
              Starejši
              <ChevronRight className="size-4" />
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}
