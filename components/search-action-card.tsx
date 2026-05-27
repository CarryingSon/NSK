import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function SearchActionCard({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <Card className="surface-glass rounded-[2rem] border border-white/60 py-0">
      <CardHeader className="px-6 pt-6">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/12 text-primary">
          <Icon className="size-7" />
        </div>
        <CardTitle className="mt-4 font-heading text-2xl font-semibold text-foreground">
          {title}
        </CardTitle>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent className="px-6 pb-6">{children}</CardContent>
    </Card>
  );
}
