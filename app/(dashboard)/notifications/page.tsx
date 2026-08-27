import Link from "next/link";
import { History } from "lucide-react";

import { NotificationComposer } from "@/components/notifications/notification-composer";
import { PageHeader } from "@/components/page-header";
import { buttonVariants } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";
import { getNotificationAudienceStats } from "@/lib/data";
import { isEmailConfigured } from "@/lib/supabase/env";
import { cn } from "@/lib/utils";

export default async function NotificationsPage() {
  const [stats, user] = await Promise.all([
    getNotificationAudienceStats(),
    getCurrentUser(),
  ]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Obveščanje"
        description="Sestavi obvestilo in ga naenkrat pošlji vsem študentom, vsem dijakom ali celotnemu članstvu."
        action={
          <Link
            href="/notifications/history"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "h-12 rounded-full px-6 text-base font-semibold",
            )}
          >
            <History className="size-4" />
            Odpri zgodovino
          </Link>
        }
      />

      {/* Obrazec je en sam stolpec: obvestilo se piše od vrha navzdol, zato
          stranska vsebina samo odvrača pozornost. */}
      <div className="max-w-4xl">
        <NotificationComposer
          stats={stats}
          emailConfigured={isEmailConfigured()}
          testEmail={user?.email ?? ""}
        />
      </div>
    </div>
  );
}
