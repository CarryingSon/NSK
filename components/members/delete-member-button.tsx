"use client";

import { Trash2 } from "lucide-react";
import type { ComponentProps } from "react";

import { deleteMemberAction } from "@/app/actions/members";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function DeleteMemberButton({
  id,
  fullName,
  returnTo = "/members",
  variant = "ghost",
  size = "sm",
  className,
  iconOnly = false,
}: {
  id: string;
  fullName: string;
  returnTo?: string;
  variant?: ComponentProps<typeof Button>["variant"];
  size?: ComponentProps<typeof Button>["size"];
  className?: string;
  /** Kvadratna ikona brez besedila - za gosto vrstico v seznamu. */
  iconOnly?: boolean;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button
            variant={variant}
            size={iconOnly ? "icon" : size}
            // Ime gumba mora obstajati tudi brez besedila, sicer ga bralnik
            // zaslona prebere kot prazen gumb.
            aria-label={iconOnly ? `Izbriši člana ${fullName}` : undefined}
            title={iconOnly ? "Izbriši" : undefined}
            className={cn(
              iconOnly && "rounded-md",
              className ??
                (variant === "ghost" ? "text-destructive" : undefined),
            )}
          />
        }
      >
        {iconOnly ? <Trash2 className="size-4" /> : "Izbriši"}
      </AlertDialogTrigger>
      <AlertDialogContent className="rounded-[18px] border border-border bg-card p-0">
        <AlertDialogHeader className="px-6 pt-6">
          <AlertDialogTitle>Izbrišem člana?</AlertDialogTitle>
          <AlertDialogDescription>
            S tem boš trajno odstranil zapis za člana <strong>{fullName}</strong>.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-xl">Prekliči</AlertDialogCancel>
          <form action={deleteMemberAction}>
            <input type="hidden" name="id" value={id} />
            <input type="hidden" name="return_to" value={returnTo} />
            <AlertDialogAction
              type="submit"
              variant="destructive"
              className="rounded-xl"
            >
              <Trash2 className="size-4" />
              Izbriši
            </AlertDialogAction>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
