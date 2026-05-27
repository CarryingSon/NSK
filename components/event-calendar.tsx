import Link from "next/link";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

import { weekdays } from "@/lib/constants";
import { formatMonthLabel, isWithinSameMonth, toMonthParam } from "@/lib/format";
import type { CalendarEvent } from "@/types/app";

export function EventCalendar({
  monthDate,
  events,
}: {
  monthDate: Date;
  events: CalendarEvent[];
}) {
  const gridStart = startOfWeek(startOfMonth(monthDate), { weekStartsOn: 1 });
  const gridEnd = endOfWeek(endOfMonth(monthDate), { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });
  const previousMonth = subMonths(monthDate, 1);
  const nextMonth = addMonths(monthDate, 1);

  return (
    <section className="surface-glass rounded-[2rem] border border-white/60 p-6">
      <div className="flex flex-col gap-4 border-b border-white/60 pb-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/12 text-primary">
              <CalendarDays className="size-5" />
            </div>
            <h2 className="font-heading text-3xl font-semibold text-foreground">
              Koledar dogodkov
            </h2>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Mesečni pregled dogodkov iz tabele <span className="font-mono">events</span>.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start rounded-full border border-white/70 bg-white/75 p-1 shadow-sm">
          <Link
            href={`/dashboard?month=${toMonthParam(previousMonth)}`}
            className="flex size-10 items-center justify-center rounded-full text-foreground transition hover:bg-muted"
          >
            <ChevronLeft className="size-4" />
          </Link>
          <div className="min-w-36 text-center font-heading text-lg font-semibold capitalize text-foreground">
            {formatMonthLabel(monthDate)}
          </div>
          <Link
            href={`/dashboard?month=${toMonthParam(nextMonth)}`}
            className="flex size-10 items-center justify-center rounded-full text-foreground transition hover:bg-muted"
          >
            <ChevronRight className="size-4" />
          </Link>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-7 gap-3 text-sm font-semibold text-muted-foreground">
        {weekdays.map((weekday) => (
          <div key={weekday} className="px-2 py-1 text-center">
            {weekday}
          </div>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-7">
        {days.map((day) => {
          const dayEvents = events.filter((event) =>
            isSameDay(new Date(event.starts_at), day),
          );

          return (
            <div
              key={day.toISOString()}
              className={`min-h-40 rounded-[1.5rem] border p-4 transition ${
                isWithinSameMonth(day, monthDate)
                  ? "border-white/60 bg-white/70"
                  : "border-transparent bg-white/35 text-muted-foreground"
              } ${isToday(day) ? "ring-2 ring-primary/50" : ""}`}
            >
              <div className="flex items-center justify-between">
                <span className="font-heading text-lg font-semibold">
                  {format(day, "d")}
                </span>
                {isToday(day) ? (
                  <span className="rounded-full bg-primary px-2 py-1 text-[11px] font-semibold text-primary-foreground">
                    Danes
                  </span>
                ) : null}
              </div>

              <div className="mt-4 space-y-2">
                {dayEvents.length === 0 ? (
                  <p className="text-xs text-muted-foreground">Brez dogodkov</p>
                ) : (
                  dayEvents.slice(0, 3).map((event) => (
                    <div
                      key={event.id}
                      className="rounded-2xl bg-primary/14 px-3 py-2 text-xs font-medium text-foreground"
                    >
                      <p className="line-clamp-1">{event.title}</p>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        {format(new Date(event.starts_at), "HH:mm")}
                        {event.location ? ` · ${event.location}` : ""}
                      </p>
                    </div>
                  ))
                )}
                {dayEvents.length > 3 ? (
                  <p className="text-xs font-medium text-muted-foreground">
                    +{dayEvents.length - 3} dodatnih
                  </p>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
