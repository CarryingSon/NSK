import Link from "next/link";
import { Lock } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";
import { appRoleLabels, getLandingPath } from "@/lib/roles";
import { cn } from "@/lib/utils";

export default async function NoAccessPage() {
  const user = await getCurrentUser();
  const role = user?.role ?? "officer";

  return (
    <div className="surface-muted flex min-h-[60vh] flex-col items-center justify-center rounded-[18px] px-8 py-16 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-background text-muted-foreground">
        <Lock className="size-6" />
      </div>
      <h1 className="mt-6 font-heading text-3xl font-semibold tracking-[-0.025em] text-foreground">
        Nimaš dostopa do te strani
      </h1>
      <p className="mt-3 max-w-md text-balance text-[0.9375rem] leading-relaxed text-muted-foreground">
        Prijavljen_a si kot {appRoleLabels[role].toLowerCase()}. Ta del
        aplikacije je pridržan administratorju. Če meniš, da bi dostop
        potreboval_a, se obrni na administratorja kluba.
      </p>
      <Link
        href={getLandingPath(role)}
        className={cn(
          buttonVariants({ size: "lg" }),
          "mt-8 h-12 rounded-full px-6 text-base font-semibold",
        )}
      >
        Nazaj na začetek
      </Link>
    </div>
  );
}
