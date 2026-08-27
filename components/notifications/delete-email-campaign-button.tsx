"use client";

import { Trash2 } from "lucide-react";

import { deleteEmailCampaignAction } from "@/app/actions/notifications";
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

export function DeleteEmailCampaignButton({
  subject,
  sentAt,
  totalSent,
}: {
  subject: string;
  sentAt: string;
  totalSent: number;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={<Button variant="ghost" size="icon-sm" className="text-destructive" />}
      >
        <Trash2 className="size-4" />
        <span className="sr-only">Izbriši kampanjo</span>
      </AlertDialogTrigger>
      <AlertDialogContent className="rounded-[18px] border border-border bg-card p-0">
        <AlertDialogHeader className="px-6 pt-6">
          <AlertDialogTitle>Izbrišem zgodovino obvestila?</AlertDialogTitle>
          <AlertDialogDescription>
            Za obvestilo <strong>{subject}</strong> bo izbrisanih <strong>{totalSent}</strong>{" "}
            zapisov pošiljanja. Ta korak je nepovraten.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-xl">Prekliči</AlertDialogCancel>
          <form action={deleteEmailCampaignAction}>
            <input type="hidden" name="subject" value={subject} />
            <input type="hidden" name="sent_at" value={sentAt} />
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
