import "server-only";

import { markEmailBounced } from "@/lib/bounces";
import { club } from "@/lib/constants";
import { buildCampaignEmailHtml, sendEmail } from "@/lib/email";
import { escapeHtml, richTextToPlainText } from "@/lib/email-content";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isEmailConfigured } from "@/lib/supabase/env";

/**
 * Pozdrav novemu članu.
 *
 * Gre ob prenosu prijave med člane in ob ročnem vnosu člana z e-naslovom. Je
 * tudi prvi preizkus naslova: če se vrne kot nedostavljiv, ga dnevni pregled
 * nabiralnika (lib/bounces.ts) označi in obvestila ga odslej preskočijo.
 *
 * Nikoli ne vrže - vpis člana ne sme pasti zaradi pošte.
 */
export async function sendWelcomeEmail({
  email,
  firstName,
  sosPending = false,
}: {
  email: string;
  firstName: string;
  /** Član je dal soglasje za ŠOS in bo od tam dobil kodo za potrditev. */
  sosPending?: boolean;
}) {
  if (!isEmailConfigured()) {
    return;
  }

  const title = `Dobrodošel_a v ${club.shortName}`;
  const contentHtml = [
    `<p>tvoja prijava je potrjena - od danes si član_ica ${club.shortName}.</p>`,
    "<p>Na ta naslov ti bomo pošiljali novice o dogodkih, izletih in ugodnostih za člane.</p>",
    sosPending
      ? "<p>V kratkem dobiš še e-pošto Študentske organizacije Slovenije s kodo. Z njo potrdiš članstvo na studentski-klubi.si - brez tega koraka ga ŠOS ne more avtomatsko podaljševati.</p>"
      : "",
    `<p>Uradne ure: ${escapeHtml(club.officeHours)}, ${escapeHtml(club.street)}, ${escapeHtml(club.city)}. Oglasi se!</p>`,
  ].join("");

  const result = await sendEmail({
    to: email,
    subject: title,
    html: buildCampaignEmailHtml({
      title,
      subtitle: "Tvoje članstvo je potrjeno",
      contentHtml,
      ctaLabel: "Poglej ugodnosti",
      ctaUrl: `${club.website}/ugodnosti`,
      recipientName: firstName,
    }),
    text: `Živjo ${firstName},\n\n${richTextToPlainText(contentHtml)}\n\nLep pozdrav,\nEkipa ${club.shortName}`,
  });

  if (result.success) {
    return;
  }

  console.error("Pozdravne e-pošte ni bilo mogoče poslati", result.error);

  if (result.recipientRejected) {
    try {
      await markEmailBounced(createSupabaseAdminClient(), {
        email: email.toLowerCase(),
        reason: result.error,
        at: new Date(),
      });
    } catch (error) {
      console.error("Naslova ni bilo mogoče označiti kot nedelujočega", error);
    }
  }
}
