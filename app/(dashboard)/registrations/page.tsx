import { ClipboardList } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { RegistrationForm } from "@/components/forms/registration-form";
import { PageHeader } from "@/components/page-header";
import { DeleteRegistrationButton } from "@/components/registrations/delete-registration-button";
import { StatusBadge } from "@/components/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getEventsForSelect,
  getMembersForSelect,
  getRegistrations,
} from "@/lib/data";
import { formatDateTime, getMemberFullName } from "@/lib/format";

export default async function RegistrationsPage() {
  const [registrationsResult, members, events] = await Promise.all([
    getRegistrations(),
    getMembersForSelect(),
    getEventsForSelect(),
  ]);

  const registrations = registrationsResult.registrations;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Prijave"
        description="Poveži člane z dogodki in vodi statuse prijav."
      />

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="surface-glass rounded-[2rem] border border-white/60 p-6">
          <h2 className="font-heading text-2xl font-semibold text-foreground">
            Nova prijava
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Izberi člana, dogodek in status prijave.
          </p>
          <div className="mt-6">
            <RegistrationForm members={members} events={events} />
          </div>
        </div>

        {registrations.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="Ni prijav"
            description="Ko dodaš prve prijave na dogodke, bodo prikazane tukaj."
          />
        ) : (
          <div className="surface-glass overflow-hidden rounded-[2rem] border border-white/60">
            <Table>
              <TableHeader>
                <TableRow className="border-white/60">
                  <TableHead className="px-6 py-4">Član</TableHead>
                  <TableHead className="px-6 py-4">Dogodek</TableHead>
                  <TableHead className="px-6 py-4">Status</TableHead>
                  <TableHead className="px-6 py-4">Prijavljeno</TableHead>
                  <TableHead className="px-6 py-4 text-right">Akcije</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {registrations.map((registration) => (
                  <TableRow key={registration.id} className="border-white/50">
                    <TableCell className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-foreground">
                          {getMemberFullName(registration.member)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {registration.member?.email || "Brez e-pošte"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-foreground">
                          {registration.event?.title || "Dogodek ni več na voljo"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {registration.event?.starts_at
                            ? formatDateTime(registration.event.starts_at)
                            : "Brez termina"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <StatusBadge status={registration.status} />
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      {formatDateTime(registration.registered_at)}
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="flex justify-end">
                        <DeleteRegistrationButton
                          id={registration.id}
                          label={`${getMemberFullName(registration.member)} · ${registration.event?.title || "Dogodek"}`}
                        />
                      </div>
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
