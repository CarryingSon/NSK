"use client";

import { Trash2 } from "lucide-react";

import { deletePrintRecordAction } from "@/app/actions/print-records";
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

export function DeletePrintRecordButton({
  id,
  title,
}: {
  id: string;
  title: string;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={<Button variant="ghost" size="sm" className="text-rose-600" />}
      >
        Izbriši
      </AlertDialogTrigger>
      <AlertDialogContent className="rounded-[1.75rem] border border-white/60 bg-white/95 p-0">
        <AlertDialogHeader className="px-6 pt-6">
          <AlertDialogTitle>Izbrišem zapis tiska?</AlertDialogTitle>
          <AlertDialogDescription>
            Zapis <strong>{title}</strong> bo trajno odstranjen iz evidence.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-2xl">Prekliči</AlertDialogCancel>
          <form action={deletePrintRecordAction}>
            <input type="hidden" name="id" value={id} />
            <AlertDialogAction
              type="submit"
              variant="destructive"
              className="rounded-2xl"
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
