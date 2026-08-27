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
    <div className="surface-muted flex min-h-[18rem] flex-col items-center justify-center rounded-[18px] px-8 py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-background text-muted-foreground">
        <Icon className="size-5" />
      </div>
      <h3 className="mt-6 font-heading text-[1.375rem] font-semibold tracking-[-0.02em] text-foreground">
        {title}
      </h3>
      <p className="mt-2 max-w-sm text-balance text-[0.9375rem] leading-relaxed text-muted-foreground">
        {description}
      </p>
    </div>
  );
}
