import { NextResponse } from "next/server";

import { optOutByToken } from "@/lib/unsubscribe";

/**
 * Odjava z enim klikom po RFC 8058.
 *
 * Gmail in Apple Mail na ta naslov pošljeta POST, ko uporabnik pritisne
 * "Odjava" ob glavi sporočila. Potrditve ne sme biti - odjemalec pričakuje, da
 * je z odgovorom 200 opravljeno.
 *
 * Stoji ločeno od strani /odjava/[token], ker route.ts in page.tsx ne moreta
 * živeti v istem segmentu poti; stran je za človeka, ta naslov za program.
 */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const result = await optOutByToken(token);

  if (!result.ok) {
    // Neveljaven žeton ni razlog za podrobno sporočilo: odjemalec ga ne prikaže,
    // bi pa razlika med "ni ga" in "napaka" izdala, kateri žetoni obstajajo.
    return new NextResponse(null, { status: 404 });
  }

  return new NextResponse(null, { status: 200 });
}
