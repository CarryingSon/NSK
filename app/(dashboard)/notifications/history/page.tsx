import { History } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";

export default function NotificationHistoryPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Zgodovina obvestil"
        description="Pregled poslanih obvestil boš lahko dodal v naslednjem koraku razvoja."
      />

      <EmptyState
        icon={History}
        title="Ni shranjene zgodovine"
        description="Stran je pripravljena za prihodnji modul obveščanja in arhiviranje sporočil."
      />
    </div>
  );
}
