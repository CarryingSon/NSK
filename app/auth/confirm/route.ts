import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";

import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Pristanek povezave iz povabila oziroma ponastavitve gesla.
 *
 * Supabase v povezavo zapiše enkratni žeton. Tu ga vnovčimo za sejo in
 * uporabnika pošljemo naprej - brez tega koraka bi /nastavi-geslo videl
 * neprijavljenega obiskovalca in ga odbil na prijavo.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/nastavi-geslo";

  // Odprti preusmeritvi se izognemo: sprejmemo samo poti znotraj aplikacije.
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/nastavi-geslo";

  if (!tokenHash || !type) {
    redirect("/login?napaka=povezava");
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });

  if (error) {
    console.error("Napaka pri preverjanju povezave iz e-pošte", error);
    redirect("/login?napaka=potekla");
  }

  redirect(safeNext);
}
