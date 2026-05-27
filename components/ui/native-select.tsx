import * as React from "react";

import { cn } from "@/lib/utils";

export function NativeSelect({
  className,
  ...props
}: React.ComponentProps<"select">) {
  return (
    <select
      className={cn(
        "flex h-11 w-full rounded-2xl border border-border bg-white/75 px-4 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/20",
        className,
      )}
      {...props}
    />
  );
}
