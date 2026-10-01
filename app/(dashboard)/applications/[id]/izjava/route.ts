import { requireUser } from "@/lib/auth";
import {
  buildDeclarationPdf,
  declarationFileName,
} from "@/lib/pristopna-izjava";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Pristopna izjava spletne prijave za prenos.
 *
 * Ob oddaji gre izjava na klubski e-naslov; tu jo je mogoče izpisati znova,
 * kadar se je sporočilo izgubilo ali ga je treba natisniti še enkrat.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  await requireUser();
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: application } = await supabase
    .from("membership_applications")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  // Starejše prijave niso imele polj izjave - izpolnjena bi bila zavajajoča.
  if (!application?.privacy_acknowledged || !application.emso) {
    return new Response("Za to prijavo pristopna izjava ne obstaja.", {
      status: 404,
    });
  }

  const pdf = await buildDeclarationPdf({
    firstName: application.first_name,
    lastName: application.last_name,
    emso: application.emso,
    address: application.address,
    postalCode: application.postal_code,
    city: application.city,
    municipality: application.municipality ?? "",
    phone: application.phone,
    email: application.email,
    memberType: application.member_type,
    sosConsent: application.sos_consent,
    mediaConsent: application.media_consent,
    newsletterConsent: application.newsletter_consent,
    submittedAt: new Date(application.created_at),
  });

  const fileName = declarationFileName(
    application.first_name,
    application.last_name,
  );

  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(fileName)}`,
      "Cache-Control": "private, no-store",
    },
  });
}
