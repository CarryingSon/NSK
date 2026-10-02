import { checkMailboxForBounces } from "@/lib/bounces";

// IMAP prijava in branje povratnic lahko trajata nekaj sekund.
export const maxDuration = 60;

/**
 * Dnevni pregled klubskega nabiralnika za nedostavljivo pošto.
 *
 * Kliče ga Vercel Cron (vercel.json) z glavo Authorization: Bearer CRON_SECRET.
 * Brez nastavljene skrivnosti pot zavrne vse - odprt pregled bi lahko kdorkoli
 * sprožal v neskončnost.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;

  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const result = await checkMailboxForBounces();
    return Response.json(result);
  } catch (error) {
    console.error("Napaka pri pregledu povratnic", error);
    return Response.json({ error: "Pregled povratnic ni uspel." }, { status: 500 });
  }
}
