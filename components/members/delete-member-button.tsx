"use client";

import { Trash2 } from "lucide-react";

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

export function DeleteMemberButton({
  id,
  fullName,
}: {
  id: string;
  fullName: string;
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
          <AlertDialogTitle>Izbrišem člana?</AlertDialogTitle>
          <AlertDialogDescription>
            S tem boš trajno odstranil zapis za člana <strong>{fullName}</strong>.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-2xl">Prekliči</AlertDialogCancel>
          <form action={deleteMemberAction}>
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
