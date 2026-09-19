import type { Metadata } from "next";

import { BugReportForm } from "@/components/forms/bug-report-form";
import { PageHeader } from "@/components/page-header";
import { requireAccess } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Sporoči napako",
};

export default async function SporociNapakoStran() {
  await requireAccess("/sporoci-napako");

  return (
    <>
      <PageHeader
        title="Sporoči napako"
        description="Če kaj ne deluje, kot bi moralo, opiši težavo in po želji priloži sliko. Sporočilo pride skrbniku aplikacije."
      />

      <div className="max-w-2xl">
        <BugReportForm />
      </div>
    </>
  );
}
