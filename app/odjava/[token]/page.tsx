import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import { UnsubscribePanel } from "@/components/notifications/unsubscribe-panel";
import { club } from "@/lib/constants";
import { findMemberByToken } from "@/lib/unsubscribe";

export const metadata: Metadata = {
  title: `Obveščanje ${club.shortName}`,
  robots: { index: false, follow: false },
};

interface UnsubscribePageProps {
  params: Promise<{ token: string }>;
}

/**
 * Odjava od obveščanja.
 *
 * Stoji zunaj skupine (dashboard) in je v zaščiti poti med odprtimi: član, ki
 * klikne povezavo v e-pošti, nima in ne potrebuje seje.
 *
 * Odjava se ne zgodi z odpiranjem povezave. Poštni odjemalci in varnostni
 * pregledovalniki povezave odpirajo sami, zato bi člana odjavili, ne da bi ta
 * karkoli pritisnil - potrditev je zato nujna in ne olepševanje.
 */
export default async function UnsubscribePage({ params }: UnsubscribePageProps) {
  const { token } = await params;
  const member = await findMemberByToken(token);

  if (!member) {
    notFound();
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col justify-center px-5 py-12 sm:px-8">
      <div className="text-center">
        <Image
          src="/nsk-logo.svg"
          alt={club.name}
          width={352}
          height={66}
          priority
          className="mx-auto h-8 w-auto dark:brightness-0 dark:invert"
        />
      </div>

      <UnsubscribePanel
        token={token}
        firstName={member.first_name}
        email={member.email}
        optedOut={member.notifications_opt_out}
      />

      <footer className="mt-8 text-center text-sm text-muted-foreground">
        {club.name} &middot; {club.street}, {club.city}
        <br />
        <a href={`mailto:${club.email}`} className="text-primary hover:underline">
          {club.email}
        </a>
      </footer>
    </main>
  );
}
