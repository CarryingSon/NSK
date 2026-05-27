import type { LucideIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string;
  value: number | string;
  description: string;
  icon: LucideIcon;
}) {
  return (
    <Card className="surface-glass rounded-[2rem] border border-white/60 py-0">
      <CardHeader className="border-b border-white/60 px-6 py-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              {title}
            </CardTitle>
            <p className="mt-4 font-heading text-4xl font-semibold text-foreground">
              {value}
            </p>
          </div>
          <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/20 text-primary-foreground">
            <Icon className="size-5" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-6 py-5 text-sm text-muted-foreground">
        {description}
      </CardContent>
    </Card>
  );
}
