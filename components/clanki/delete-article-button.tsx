"use client";

import { Trash2 } from "lucide-react";

import { deleteArticleAction } from "@/app/actions/articles";
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

export function DeleteArticleButton({ id, title }: { id: string; title: string }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button variant="outline" size="lg" className="h-12 rounded-full px-6 text-destructive" />
        }
      >
        <Trash2 className="size-4" />
        Izbriši
      </AlertDialogTrigger>
      <AlertDialogContent className="rounded-[18px] border border-border bg-card p-0">
        <AlertDialogHeader className="px-6 pt-6">
          <AlertDialogTitle>Izbrišem članek?</AlertDialogTitle>
          <AlertDialogDescription>
            Članek <strong>{title}</strong> bo izbrisan skupaj s slikami in
            izgine s spletne strani. Ta korak je nepovraten - če ga želiš le
            skriti, ga raje umakni z objave.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-xl">Prekliči</AlertDialogCancel>
          <form action={deleteArticleAction}>
            <input type="hidden" name="id" value={id} />
            <AlertDialogAction type="submit" variant="destructive" className="rounded-xl">
              <Trash2 className="size-4" />
              Izbriši
            </AlertDialogAction>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
