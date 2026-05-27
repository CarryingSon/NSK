import { Ticket } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getCoupons } from "@/lib/data";
import { formatCurrency, formatDate } from "@/lib/format";

export default async function CouponsPage() {
  const coupons = await getCoupons();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Kupončki"
        description="Pregled trenutno ustvarjenih kuponov in njihove veljavnosti."
      />

      {coupons.length === 0 ? (
        <EmptyState
          icon={Ticket}
          title="Ni kuponov"
          description="Tabela coupons je pripravljena. Ko boš dodal prve zapise v Supabase, bodo prikazani tukaj."
        />
      ) : (
        <section className="surface-glass overflow-hidden rounded-[2rem] border border-white/60">
          <Table>
            <TableHeader>
              <TableRow className="border-white/60">
                <TableHead className="px-6 py-4">Koda</TableHead>
                <TableHead className="px-6 py-4">Opis</TableHead>
                <TableHead className="px-6 py-4">Popust</TableHead>
                <TableHead className="px-6 py-4">Veljavnost</TableHead>
                <TableHead className="px-6 py-4">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coupons.map((coupon) => (
                <TableRow key={coupon.id} className="border-white/50">
                  <TableCell className="px-6 py-4 font-mono font-medium">
                    {coupon.code}
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    {coupon.description || "Brez opisa"}
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    {coupon.discount_type || "—"}{" "}
                    {coupon.discount_value ? `(${formatCurrency(coupon.discount_value)})` : ""}
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    {formatDate(coupon.valid_from)} - {formatDate(coupon.valid_to)}
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <StatusBadge status={coupon.active ? "active" : "inactive"} />
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
