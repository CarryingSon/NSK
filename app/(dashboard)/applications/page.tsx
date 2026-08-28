import Link from "next/link";
import { ClipboardList, FileText, Globe, SquareArrowOutUpRight } from "lucide-react";

import { ApplicationActions } from "@/components/applications/application-actions";
import { DeleteApplicationButton } from "@/components/applications/delete-application-button";
import { EmbedPanel } from "@/components/applications/embed-panel";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  applicationFilters,
  applicationFormPath,
  applicationStatusLabels,
  memberSegmentLabels,
} from "@/lib/constants";
import { getApplications } from "@/lib/data";
import { formatDateTime } from "@/lib/format";
import { getSiteUrl } from "@/lib/site-url";
import { cn } from "@/lib/utils";
import type { ApplicationStatus } from "@/types/database";
import { requireAdmin } from "@/lib/auth";

const tabs = [
  { value: "submissions", label: "Spletne prijave", icon: Globe },
  { value: "embed", label: "Obrazec za vgradnjo", icon: SquareArrowOutUpRight },
] as const;

function parseStatus(value?: string): ApplicationStatus | "all" {
  return value === "pending" || value === "approved" || value === "rejected"
    ? value
    : "all";
}

// Zavihek in filter živita v naslovu, ne v stanju komponente: stran ostane
// strežniška, povezavo na določen filter pa se da deliti in osvežiti.
export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; status?: string }>;
}) {
  await requireAdmin();

  const params = await searchParams;
  const activeTab = params.tab === "embed" ? "embed" : "submissions";
  const status = parseStatus(params.status);

  const formUrl = `${getSiteUrl()}${applicationFormPath}`;
  const snippet = `<iframe src="${formUrl}" width="100%" height="1400" frameborder="0" style="border:none;max-width:1000px;margin:0 auto;display:block;"></iframe>`;

  const { rows, counts } = await getApplications(status);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Prijave članov"
        description="Prijavnice, oddane prek obrazca na klubski spletni strani, in koda za njegovo vgradnjo."
      />

      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.value;

          return (
            <Link
              key={tab.value}
              href={`/applications?tab=${tab.value}`}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border border-transparent px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                isActive && "border-border bg-card text-foreground",
              )}
            >
              <tab.icon className="size-4" />
              {tab.label}
            </Link>
          );
        })}
      </div>

      {activeTab === "embed" ? (
        <EmbedPanel formUrl={formUrl} snippet={snippet} />
      ) : (
        <section className="surface-card rounded-[18px] border border-border">
          <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="font-heading text-2xl font-semibold text-foreground">
                Prijave za članstvo
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Prijavnice, oddane prek spletnega obrazca.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {applicationFilters.map((filter) => {
                const isActive = status === filter.value;

                return (
                  <Link
                    key={filter.value}
                    href={`/applications?status=${filter.value}`}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {filter.label}
                    <span className="ml-1.5 tabular-nums opacity-70">
                      {counts[filter.value]}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>

          {rows.length === 0 ? (
            <div className="px-6 pb-6">
              <EmptyState
                icon={ClipboardList}
                title="Ni prijav"
                description={
                  status === "all"
                    ? "Ko nekdo odda prijavnico prek obrazca na spletni strani, se prikaže tukaj."
                    : "V tem stanju trenutno ni nobene prijave."
                }
              />
            </div>
          ) : (
            <div className="overflow-x-auto border-t border-border">
              <Table className="min-w-full">
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="px-4 py-4">Datum</TableHead>
                    <TableHead className="px-4 py-4">Ime in priimek</TableHead>
                    <TableHead className="px-4 py-4">E-pošta</TableHead>
                    <TableHead className="px-4 py-4">Status člana</TableHead>
                    <TableHead className="px-4 py-4">Potrdilo</TableHead>
                    <TableHead className="px-4 py-4">Status</TableHead>
                    <TableHead className="px-4 py-4 text-right">Ukrepi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((application) => {
                    const fullName = `${application.first_name} ${application.last_name}`;

                    return (
                      <TableRow key={application.id} className="border-border">
                        <TableCell className="px-4 py-4 whitespace-nowrap text-sm tabular-nums text-muted-foreground">
                          {formatDateTime(application.created_at)}
                        </TableCell>
                        <TableCell className="px-4 py-4">
                          <p className="font-medium text-foreground">{fullName}</p>
                          <p className="text-xs text-muted-foreground">
                            {application.school}
                          </p>
                        </TableCell>
                        <TableCell className="px-4 py-4 text-sm text-muted-foreground">
                          <a
                            href={`mailto:${application.email}`}
                            className="hover:text-primary hover:underline"
                          >
                            {application.email}
                          </a>
                        </TableCell>
                        <TableCell className="px-4 py-4">
                          <Badge variant="secondary">
                            {memberSegmentLabels[application.member_type]}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-4 py-4">
                          {application.proofUrl ? (
                            <a
                              href={application.proofUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                            >
                              <FileText className="size-4" />
                              Odpri
                            </a>
                          ) : (
                            <span className="text-sm text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="px-4 py-4">
                          <Badge
                            variant={
                              application.status === "approved"
                                ? "default"
                                : application.status === "rejected"
                                  ? "destructive"
                                  : "outline"
                            }
                          >
                            {applicationStatusLabels[application.status]}
                          </Badge>
                          {application.member_id ? (
                            <p className="mt-1 text-xs text-muted-foreground">
                              Med člani
                            </p>
                          ) : null}
                        </TableCell>
                        <TableCell className="px-4 py-4">
                          <div className="flex items-start justify-end gap-2">
                            <ApplicationActions
                              id={application.id}
                              status={application.status}
                              hasMember={Boolean(application.member_id)}
                            />
                            <DeleteApplicationButton
                              id={application.id}
                              name={fullName}
                              hasProof={Boolean(application.proof_path)}
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
