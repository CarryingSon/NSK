"use client";

import { Trash2 } from "lucide-react";

import { deleteApplicationAction } from "@/app/actions/applications";
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

export function DeleteApplicationButton({
  id,
  name,
  hasProof,
}: {
  id: string;
  name: string;
  hasProof: boolean;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={<Button variant="ghost" size="icon-sm" className="text-destructive" />}
      >
        <Trash2 className="size-4" />
        <span className="sr-only">Izbriši prijavo</span>
      </AlertDialogTrigger>
      <AlertDialogContent className="rounded-[18px] border border-border bg-card p-0">
        <AlertDialogHeader className="px-6 pt-6">
          <AlertDialogTitle>Izbrišem prijavo?</AlertDialogTitle>
          <AlertDialogDescription>
            Prijava, ki jo je oddal_a <strong>{name}</strong>, bo izbrisana
            {hasProof ? ", skupaj z naloženim potrdilom o vpisu" : ""}. Ta korak
            je nepovraten. Če je iz prijave že nastal član, ta ostane v evidenci.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-xl">Prekliči</AlertDialogCancel>
          <form action={deleteApplicationAction}>
            <input type="hidden" name="id" value={id} />
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
