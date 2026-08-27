"use client";

import { Fragment, useActionState, useMemo, useState } from "react";
import { ChevronRight, Minus, Plus, Search, Trash2 } from "lucide-react";

import {
  addPrintCopiesAction,
  adjustPrintCopiesAction,
  deleteMemberPrintMonthAction,
} from "@/app/actions/print-records";
import { SubmitButton } from "@/components/forms/submit-button";
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
import { Input } from "@/components/ui/input";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ActionState, PrintMemberRow } from "@/types/app";

const initialState: ActionState = {};

/** Vrstica za vpis kopij. Predznak določi akcija, zato je vnos vedno pozitiven. */
function CopiesForm({
  memberId,
  mode,
  onDone,
}: {
  memberId: string;
  mode: "add" | "adjust";
  onDone: () => void;
}) {
  const [state, formAction] = useActionState(
    mode === "add" ? addPrintCopiesAction : adjustPrintCopiesAction,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <input type="hidden" name="member_id" value={memberId} />

      <div className="space-y-1.5">
        <label
          htmlFor={`quantity-${mode}-${memberId}`}
          className="text-xs text-muted-foreground"
        >
          {mode === "add" ? "Število kopij" : "Koliko odštejem"}
        </label>
        <Input
          id={`quantity-${mode}-${memberId}`}
          name="quantity"
          type="number"
          min="1"
          step="1"
          defaultValue="1"
          required
          className="h-10 w-32"
        />
      </div>

      <div className="min-w-48 flex-1 space-y-1.5">
        <label
          htmlFor={`note-${mode}-${memberId}`}
          className="text-xs text-muted-foreground"
        >
          Opomba (neobvezno)
        </label>
        <Input
          id={`note-${mode}-${memberId}`}
          name="note"
          placeholder={mode === "add" ? "Npr. skripta za izpit" : "Npr. napačen vnos"}
          className="h-10"
        />
      </div>

      <SubmitButton
        type="submit"
        variant={mode === "add" ? "default" : "outline"}
        pendingLabel="Shranjujem ..."
        className="h-10"
        onClick={() => window.setTimeout(onDone, 400)}
      >
        {mode === "add" ? "Dodaj kopije" : "Odštej"}
      </SubmitButton>

      <Button type="button" variant="ghost" className="h-10" onClick={onDone}>
        Prekliči
      </Button>

      {state.error ? (
        <p className="w-full text-sm text-destructive">{state.error}</p>
      ) : null}
      {state.success ? (
        <p className="w-full text-sm text-success">{state.success}</p>
      ) : null}
    </form>
  );
}

export function PrintMembersTable({
  rows,
  monthParam,
  monthLabel,
  readOnly = false,
}: {
  rows: PrintMemberRow[];
  monthParam: string;
  monthLabel: string;
  readOnly?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [form, setForm] = useState<{ id: string; mode: "add" | "adjust" } | null>(
    null,
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? rows.filter((r) => r.fullName.toLowerCase().includes(q)) : rows;
  }, [rows, query]);

  return (
    <section className="surface-card overflow-hidden rounded-[18px]">
      <div className="flex flex-col gap-4 border-b border-border p-6 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-heading text-2xl font-semibold tracking-[-0.02em]">
          Člani
        </h2>
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Išči člana ..."
            className="pl-10"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="px-6 py-12 text-center text-[0.9375rem] text-muted-foreground">
          {rows.length === 0
            ? `V mesecu ${monthLabel} še ni zabeleženih kopij.`
            : "Noben član se ne ujema z iskanjem."}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[52rem] text-[0.9375rem]">
            <thead>
              <tr className="border-b border-border text-left text-[0.8125rem] text-muted-foreground">
                <th className="w-10 py-3 pl-6" />
                <th className="py-3 pr-4 font-medium">Član</th>
                <th className="py-3 pr-4 font-medium">Porabljeno ({monthLabel})</th>
                <th className="py-3 pr-4 font-medium">Preostalo</th>
                <th className="py-3 pr-4 font-medium">Prejšnji mesec</th>
                {readOnly ? null : (
                  <th className="py-3 pr-6 text-right font-medium">Akcije</th>
                )}
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => {
                const isOpen = expanded === row.memberId;
                const isFormOpen = form?.id === row.memberId;

                return (
                  <Fragment key={row.memberId}>
                    <tr className="border-b border-border">
                      <td className="py-4 pl-6">
                        <button
                          type="button"
                          aria-label={isOpen ? "Skrij zapise" : "Prikaži zapise"}
                          aria-expanded={isOpen}
                          onClick={() => setExpanded(isOpen ? null : row.memberId)}
                          className="flex size-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                        >
                          <ChevronRight
                            className={cn(
                              "size-4 transition-transform",
                              isOpen && "rotate-90",
                            )}
                          />
                        </button>
                      </td>
                      <td className="py-4 pr-4 font-medium">{row.fullName}</td>
                      <td className="py-4 pr-4 font-semibold tabular-nums">
                        {row.used}
                      </td>
                      <td
                        className={cn(
                          "py-4 pr-4 tabular-nums",
                          row.remaining < 0 ? "text-destructive" : "text-success",
                        )}
                      >
                        {row.remaining}
                      </td>
                      <td className="py-4 pr-4 tabular-nums text-muted-foreground">
                        {row.previousMonth}
                      </td>
                      {readOnly ? null : (
                      <td className="py-4 pr-6">
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            size="sm"
                            onClick={() =>
                              setForm(
                                isFormOpen && form?.mode === "add"
                                  ? null
                                  : { id: row.memberId, mode: "add" },
                              )
                            }
                          >
                            <Plus className="size-4" />
                            Dodaj
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              setForm(
                                isFormOpen && form?.mode === "adjust"
                                  ? null
                                  : { id: row.memberId, mode: "adjust" },
                              )
                            }
                          >
                            <Minus className="size-4" />
                            Prilagodi
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger
                              render={
                                <Button
                                  size="icon-sm"
                                  variant="ghost"
                                  className="text-destructive"
                                />
                              }
                            >
                              <Trash2 className="size-4" />
                              <span className="sr-only">
                                Odstrani mesečno porabo
                              </span>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="rounded-[18px] border border-border bg-card p-0">
                              <AlertDialogHeader className="px-6 pt-6">
                                <AlertDialogTitle>
                                  Odstranim porabo za {monthLabel}?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Vsi zapisi člana <strong>{row.fullName}</strong>{" "}
                                  v mesecu {monthLabel} bodo trajno izbrisani.
                                  Zapisi drugih mesecev ostanejo nedotaknjeni.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="rounded-full">
                                  Prekliči
                                </AlertDialogCancel>
                                <form action={deleteMemberPrintMonthAction}>
                                  <input
                                    type="hidden"
                                    name="member_id"
                                    value={row.memberId}
                                  />
                                  <input
                                    type="hidden"
                                    name="month"
                                    value={monthParam}
                                  />
                                  <AlertDialogAction
                                    type="submit"
                                    variant="destructive"
                                    className="rounded-full"
                                  >
                                    <Trash2 className="size-4" />
                                    Izbriši
                                  </AlertDialogAction>
                                </form>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </td>
                      )}
                    </tr>

                    {isFormOpen ? (
                      <tr className="border-b border-border">
                        <td colSpan={readOnly ? 5 : 6} className="surface-muted px-6 py-4">
                          <CopiesForm
                            memberId={row.memberId}
                            mode={form.mode}
                            onDone={() => setForm(null)}
                          />
                        </td>
                      </tr>
                    ) : null}

                    {isOpen ? (
                      <tr className="border-b border-border">
                        <td colSpan={readOnly ? 5 : 6} className="surface-muted px-6 py-4">
                          <p className="mb-3 text-[0.8125rem] font-medium text-muted-foreground">
                            Posamezni zapisi ({row.entries.length})
                          </p>
                          <ul className="space-y-2">
                            {row.entries.map((entry) => (
                              <li
                                key={entry.id}
                                className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border pb-2 last:border-0 last:pb-0"
                              >
                                <span>
                                  <span
                                    className={cn(
                                      "font-semibold tabular-nums",
                                      entry.quantity < 0 && "text-destructive",
                                    )}
                                  >
                                    {entry.quantity > 0 ? "+" : ""}
                                    {entry.quantity}
                                  </span>{" "}
                                  <span className="text-muted-foreground">
                                    {entry.title ?? "Kopije"}
                                    {entry.notes ? ` - ${entry.notes}` : ""}
                                  </span>
                                </span>
                                <span className="text-[0.8125rem] text-muted-foreground">
                                  {formatDateTime(entry.created_at)}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
