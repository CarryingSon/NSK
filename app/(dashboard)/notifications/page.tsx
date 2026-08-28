import Link from "next/link";
import { History } from "lucide-react";

import { NotificationComposer } from "@/components/notifications/notification-composer";
import { PageHeader } from "@/components/page-header";
import { buttonVariants } from "@/components/ui/button";
import { getCurrentUser, requireAdmin } from "@/lib/auth";
import { getNotificationAudienceStats } from "@/lib/data";
import { isEmailConfigured } from "@/lib/supabase/env";
import { cn } from "@/lib/utils";

export default async function NotificationsPage() {
  await requireAdmin();

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

      {/* Širino odmerja že AppShell (76rem), zato tu ni dodatne omejitve -
          obrazec se drži iste mreže kot člani in evidenca tiska. */}
      <NotificationComposer
        stats={stats}
        emailConfigured={isEmailConfigured()}
        testEmail={user?.email ?? ""}
      />
    </div>
  );
}
