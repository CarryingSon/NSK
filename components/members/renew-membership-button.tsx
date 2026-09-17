import Link from "next/link";
import { CalendarPlus } from "lucide-react";
import type { ComponentProps } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import { formatMembershipYear } from "@/lib/membership";
import { cn } from "@/lib/utils";

/**
 * Povezava na podaljšanje članstva.
 *
 * Pokaže se samo pri članih, ki podaljšanje čakajo - zato je lahko poudarjena,
 * ne da bi seznam preplavila. Vrnitev nazaj na seznam nosi s sabo, da uradnik
 * pri delu po vrsti ne konča vsakič na strani posameznega člana.
 */
export function RenewMembershipButton({
  id,
  targetYear,
  returnTo = "/members",
  size = "sm",
  className,
}: {
  id: string;
  targetYear: number;
  returnTo?: string;
  size?: ComponentProps<typeof Button>["size"];
  className?: string;
}) {
  return (
    <Link
      href={`/members/${id}/podaljsanje?return_to=${encodeURIComponent(returnTo)}`}
      title={`Podaljšaj članstvo za ${formatMembershipYear(targetYear)}`}
      className={cn(
        buttonVariants({ variant: "default", size }),
        "rounded-full",
        className,
      )}
    >
      <CalendarPlus className="size-4" />
      Podaljšaj
    </Link>
  );
}
