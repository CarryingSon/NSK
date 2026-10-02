import Link from "next/link";
import { FilePenLine, Plus } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { requireAccess } from "@/lib/auth";
import { getArticles } from "@/lib/data";
import { formatDate, formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

export default async function ArticlesPage() {
  await requireAccess("/clanki");
  const articles = await getArticles();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Članki"
        description="Novice za razdelek Aktualno na klubski spletni strani. Objavljen članek je na strani takoj, osnutek vidiš samo tu."
        action={
          <Link
            href="/clanki/new"
            className={cn(buttonVariants({ size: "lg" }), "h-12 rounded-full px-6")}
          >
            <Plus className="size-4" />
            Nov članek
          </Link>
        }
      />

      {articles.length === 0 ? (
        <EmptyState
          icon={FilePenLine}
          title="Še ni člankov"
          description="Napiši prvega - ko ga objaviš, se pokaže na naslovnici in pod Aktualno."
        />
      ) : (
        <div className="overflow-x-auto rounded-[18px] border border-border">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow className="border-border">
                <TableHead className="px-4 py-4">Naslov</TableHead>
                <TableHead className="px-4 py-4">Stanje</TableHead>
                <TableHead className="px-4 py-4">Objavljeno</TableHead>
                <TableHead className="px-4 py-4">Zadnja sprememba</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {articles.map((article) => (
                <TableRow key={article.id} className="border-border">
                  <TableCell className="px-4 py-4">
                    <Link
                      href={`/clanki/${article.id}`}
                      className="font-medium text-foreground hover:text-primary hover:underline"
                    >
                      {article.title}
                    </Link>
                  </TableCell>
                  <TableCell className="px-4 py-4">
                    <Badge variant={article.status === "published" ? "default" : "secondary"}>
                      {article.status === "published" ? "Objavljeno" : "Osnutek"}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-4 whitespace-nowrap text-sm tabular-nums text-muted-foreground">
                    {article.status === "published" ? formatDate(article.published_at) : "—"}
                  </TableCell>
                  <TableCell className="px-4 py-4 whitespace-nowrap text-sm tabular-nums text-muted-foreground">
                    {formatDateTime(article.updated_at)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
