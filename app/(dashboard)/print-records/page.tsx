import { Newspaper } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { PrintRecordForm } from "@/components/forms/print-record-form";
import { PageHeader } from "@/components/page-header";
import { DeletePrintRecordButton } from "@/components/print-records/delete-print-record-button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getMembersForSelect, getPrintRecords } from "@/lib/data";
import { formatDateTime, getMemberFullName } from "@/lib/format";

export default async function PrintRecordsPage() {
  const [records, members] = await Promise.all([
    getPrintRecords(),
    getMembersForSelect(),
  ]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Evidenca tiska"
        description="Beleženje tiskovin, količin in povezanih članov v eni interni evidenci."
      />

      <section className="surface-card rounded-[18px] border border-border p-6">
        <div className="mb-6">
          <h2 className="font-heading text-2xl font-semibold text-foreground">
            Dodaj nov zapis
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Evidenca je pripravljena za spremljanje plakatov, letakov, skript in
            drugih klubskih tiskovin.
          </p>
        </div>

        <PrintRecordForm members={members} />
      </section>

      {records.length === 0 ? (
        <EmptyState
          icon={Newspaper}
          title="Ni zapisov tiska"
          description="Ko vneseš prvi zapis, se bodo tukaj prikazali vsi izpisi in povezana zgodovina."
        />
      ) : (
        <section className="surface-card overflow-hidden rounded-[18px] border border-border">
          <Table>
            <TableHeader>
              <TableRow className="border-border">
                <TableHead className="px-4 py-4">Naslov</TableHead>
                <TableHead className="px-4 py-4">Član</TableHead>
                <TableHead className="px-4 py-4">Količina</TableHead>
                <TableHead className="px-4 py-4">Ustvarjeno</TableHead>
                <TableHead className="px-4 py-4">Opombe</TableHead>
                <TableHead className="px-4 py-4 text-right">Akcije</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((record) => (
                <TableRow key={record.id} className="border-border">
                  <TableCell className="px-4 py-4 font-medium text-foreground">
                    {record.title || "Brez naslova"}
                  </TableCell>
                  <TableCell className="px-4 py-4">
                    {getMemberFullName(record.member)}
                  </TableCell>
                  <TableCell className="px-4 py-4">{record.quantity || 1}</TableCell>
                  <TableCell className="px-4 py-4">
                    {formatDateTime(record.created_at)}
                  </TableCell>
                  <TableCell className="px-4 py-4 text-muted-foreground">
                    {record.notes || "—"}
                  </TableCell>
                  <TableCell className="px-4 py-4">
                    <div className="flex justify-end">
                      <DeletePrintRecordButton
                        id={record.id}
                        title={record.title || "Brez naslova"}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </section>
      )}
    </div>
  );
}
