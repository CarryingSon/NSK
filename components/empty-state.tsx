import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="surface-glass flex min-h-64 flex-col items-center justify-center rounded-[2rem] border border-white/60 px-8 py-12 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/12 text-primary shadow-sm">
        <Icon className="size-6" />
      </div>
      <h3 className="mt-5 font-heading text-2xl font-semibold text-foreground">
        {title}
      </h3>
      <p className="mt-3 max-w-md text-balance text-sm text-muted-foreground">
        {description}
      </p>
    </div>
  );
}
