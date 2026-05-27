import { Newspaper } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getPrintRecords } from "@/lib/data";
import { formatDateTime, getMemberFullName } from "@/lib/format";

export default async function PrintRecordsPage() {
  const records = await getPrintRecords();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Evidenca tiska"
        description="Osnovni pregled tiskovin in povezanih članov."
      />

      {records.length === 0 ? (
        <EmptyState
          icon={Newspaper}
          title="Ni zapisov tiska"
          description="Ko bo tabela print_records napolnjena, bodo tukaj vidni vsi zapisi tiska."
        />
      ) : (
        <section className="surface-glass overflow-hidden rounded-[2rem] border border-white/60">
          <Table>
            <TableHeader>
              <TableRow className="border-white/60">
                <TableHead className="px-6 py-4">Naslov</TableHead>
                <TableHead className="px-6 py-4">Član</TableHead>
                <TableHead className="px-6 py-4">Količina</TableHead>
                <TableHead className="px-6 py-4">Ustvarjeno</TableHead>
                <TableHead className="px-6 py-4">Opombe</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((record) => (
                <TableRow key={record.id} className="border-white/50">
                  <TableCell className="px-6 py-4 font-medium text-foreground">
                    {record.title || "Brez naslova"}
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    {getMemberFullName(record.member)}
                  </TableCell>
                  <TableCell className="px-6 py-4">{record.quantity || 1}</TableCell>
                  <TableCell className="px-6 py-4">
                    {formatDateTime(record.created_at)}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-muted-foreground">
                    {record.notes || "—"}
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
