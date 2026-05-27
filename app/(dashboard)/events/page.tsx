import { CalendarRange, Clock3, MapPin } from "lucide-react";

import { DeleteEventButton } from "@/components/events/delete-event-button";
import { EmptyState } from "@/components/empty-state";
import { EventForm } from "@/components/forms/event-form";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getEvents } from "@/lib/data";
import { formatDateTime } from "@/lib/format";

export default async function EventsPage() {
  const { events } = await getEvents();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dogodki"
        description="Pregled prihajajočih dogodkov in ustvarjanje novih terminov."
      />

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="surface-glass rounded-[2rem] border border-white/60 p-6">
          <h2 className="font-heading text-2xl font-semibold text-foreground">
            Nov dogodek
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Ustvari nov dogodek in ga takoj prikaži v koledarju.
          </p>
          <div className="mt-6">
            <EventForm />
          </div>
        </div>

        <div className="space-y-4">
          {events.length === 0 ? (
            <EmptyState
              icon={CalendarRange}
              title="Ni zabeleženih dogodkov"
              description="Dodaj prvi dogodek in začni graditi koledar kluba."
            />
          ) : (
            <div className="surface-glass overflow-hidden rounded-[2rem] border border-white/60">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/60">
                    <TableHead className="px-6 py-4">Dogodek</TableHead>
                    <TableHead className="px-6 py-4">Termin</TableHead>
                    <TableHead className="px-6 py-4">Status</TableHead>
                    <TableHead className="px-6 py-4 text-right">Akcije</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.map((event) => (
                    <TableRow key={event.id} className="border-white/50">
                      <TableCell className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-foreground">{event.title}</p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {event.description || "Brez opisa"}
                          </p>
                          <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="size-3.5" />
                              {event.location || "Brez lokacije"}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Clock3 className="size-3.5" />
                              {event.max_attendees
                                ? `Max. ${event.max_attendees} prijav`
                                : "Brez omejitve"}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <p>{formatDateTime(event.starts_at)}</p>
                        <p className="text-sm text-muted-foreground">
                          {event.ends_at ? formatDateTime(event.ends_at) : "Brez konca"}
                        </p>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <StatusBadge status={event.status} />
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="flex justify-end">
                          <DeleteEventButton id={event.id} title={event.title} />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
