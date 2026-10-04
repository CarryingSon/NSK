import Link from "next/link";
import { History, ScrollText } from "lucide-react";

import { cn } from "@/lib/utils";

const tabs = [
  { value: "obvestila", label: "Obvestila", icon: History, href: "/notifications/history" },
  {
    value: "dnevnik",
    label: "Dnevnik e-pošte",
    icon: ScrollText,
    href: "/notifications/history?tab=dnevnik",
  },
] as const;

export function HistoryTabs({ active }: { active: "obvestila" | "dnevnik" }) {
  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((tab) => {
        const isActive = active === tab.value;

        return (
          <Link
            key={tab.value}
            href={tab.href}
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
  );
}
