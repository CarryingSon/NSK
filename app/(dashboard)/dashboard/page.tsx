import Link from "next/link";
import {
  CalendarDays,
  ClipboardList,
  Plus,
  Search,
  UserCheck,
  UserMinus,
} from "lucide-react";

import { EventCalendar } from "@/components/event-calendar";
import { PageHeader } from "@/components/page-header";
import { SearchActionCard } from "@/components/search-action-card";
import { StatCard } from "@/components/stat-card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getDashboardData } from "@/lib/data";
import { cn } from "@/lib/utils";

interface DashboardPageProps {
  searchParams: Promise<{
    month?: string;
  }>;
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const { month } = await searchParams;
  const { stats, events, monthDate } = await getDashboardData(month);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Nadzorna plošča"
        description="Dobrodošli v sistemu Poziralnik"
      />

      <section className="grid gap-6 xl:grid-cols-3">
        <SearchActionCard
          icon={Search}
          title="Najdi člana"
          description="Išči po imenu, priimku ali e-pošti"
        >
          <form action="/members" method="GET" className="space-y-4">
            <Input
              name="query"
              placeholder="Npr. Maja Novak"
              className="h-12 rounded-2xl bg-white/80 px-4 shadow-sm"
            />
            <Button
              type="submit"
              className="h-12 w-full rounded-2xl text-base font-semibold shadow-lg shadow-primary/20"
            >
              Išči
            </Button>
          </form>
        </SearchActionCard>

        <SearchActionCard
          icon={Plus}
          title="Nov član"
          description="Dodaj novega člana v evidenco"
        >
          <Link
            href="/members/new"
            className={cn(
              buttonVariants({ variant: "default", size: "lg" }),
              "h-12 w-full rounded-2xl text-base font-semibold shadow-lg shadow-primary/20",
            )}
          >
            Dodaj
          </Link>
        </SearchActionCard>

        <SearchActionCard
          icon={CalendarDays}
          title="Najdi dogodek"
          description="Preglej prihajajoče dogodke"
        >
          <Link
            href="/events"
            className={cn(
              buttonVariants({ variant: "default", size: "lg" }),
              "h-12 w-full rounded-2xl text-base font-semibold shadow-lg shadow-primary/20",
            )}
          >
            Pregled
          </Link>
        </SearchActionCard>
      </section>

      <section className="space-y-4">
        <h2 className="font-heading text-3xl font-semibold text-foreground">Pregled</h2>
        <div className="grid gap-6 xl:grid-cols-4">
          <StatCard
            title="Aktivni člani"
            value={stats.activeMembers}
            description="Trenutno aktivni člani kluba."
            icon={UserCheck}
          />
          <StatCard
            title="Neaktivni člani"
            value={stats.inactiveMembers}
            description="Člani brez aktivnega statusa."
            icon={UserMinus}
          />
          <StatCard
            title="Nove prijave"
            value={stats.pendingApplications}
            description="Članstva v postopku potrditve."
            icon={ClipboardList}
          />
          <StatCard
            title="Prihajajoči dogodki"
            value={stats.upcomingEvents}
            description="Dogodki v naslednjih 30 dneh."
            icon={CalendarDays}
          />
        </div>
      </section>

      <EventCalendar monthDate={monthDate} events={events} />
    </div>
  );
}
