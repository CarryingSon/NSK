"use server";

import { z } from "zod";

import { requireUser } from "@/lib/auth";
import { appName } from "@/lib/constants";
import { sendEmail, type EmailAttachment } from "@/lib/email";
import type { ActionState } from "@/types/app";

// Prejemnik stoji v okolju in ne v kodi: gre za oseben naslov, repozitorij pa
// je skupen. ADMIN_EMAIL je zasilna možnost, ker je ta naslov tam že nastavljen.
function getRecipient() {
  return process.env.BUG_REPORT_EMAIL ?? process.env.ADMIN_EMAIL ?? null;
}

// Priponka gre v e-pošto, ne v hrambo. Poštni strežniki sporočila nad ~10 MB
// pogosto zavrnejo, zato je meja postavljena nižje - s prostorom za glave in
// kodiranje base64, ki priponko poveča za približno tretjino.
const maxScreenshotBytes = 5 * 1024 * 1024;

const allowedScreenshotTypes = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/heic",
  "image/gif",
]);

const reportSchema = z.object({
  summary: z
    .string()
    .trim()
    .min(5, "Na kratko napiši, kaj je narobe.")
    .max(120, "Naslov naj bo krajši od 120 znakov."),
  details: z
    .string()
    .trim()
    .min(15, "Opiši, kaj se je zgodilo - nekaj stavkov je dovolj.")
    .max(4000, "Opis je predolg."),
  page: z.string().trim().max(200).optional(),
});

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function reportBugAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  // Prijava napake je dosegljiva samo iz plošče, a se akcija kliče po HTTP in
  // je zato treba vlogo preveriti tu, ne le ob izrisu strani.
  const user = await requireUser();

  const recipient = getRecipient();

  if (!recipient) {
    return {
      error:
        "Prejemnik prijav ni nastavljen (BUG_REPORT_EMAIL). Sporočilo ni bilo poslano.",
    };
  }

  const parsed = reportSchema.safeParse({
    summary: formData.get("summary"),
    details: formData.get("details"),
    page: formData.get("page") ?? undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Prijave ni bilo mogoče poslati." };
  }

  const screenshot = formData.get("screenshot");
  const hasScreenshot = screenshot instanceof File && screenshot.size > 0;
  const attachments: EmailAttachment[] = [];

  if (hasScreenshot) {
    if (screenshot.size > maxScreenshotBytes) {
      return { error: "Slika je večja od 5 MB. Priloži manjšo." };
    }

    if (!allowedScreenshotTypes.has(screenshot.type)) {
      return { error: "Slika mora biti PNG, JPG, WEBP, GIF ali HEIC." };
    }

    attachments.push({
      filename: screenshot.name || "zaslonska-slika",
      content: Buffer.from(await screenshot.arrayBuffer()),
      contentType: screenshot.type,
    });
  }

  const { summary, details, page } = parsed.data;
  const prijavitelj = user?.email ?? "neznan uporabnik";

  const vrstice = [
    ["Prijavil", prijavitelj],
    ["Stran", page || "ni navedena"],
    ["Čas", new Date().toLocaleString("sl-SI", { timeZone: "Europe/Ljubljana" })],
    ["Slika", hasScreenshot ? "priložena" : "ni priložena"],
  ];

  const text = [
    `${summary}`,
    "",
    details,
    "",
    ...vrstice.map(([kljuc, vrednost]) => `${kljuc}: ${vrednost}`),
  ].join("\n");

  const html = `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:15px;line-height:1.6;color:#1d1d1f">
  <h2 style="margin:0 0 16px;font-size:18px">${escapeHtml(summary)}</h2>
  <p style="white-space:pre-wrap;margin:0 0 24px">${escapeHtml(details)}</p>
  <table style="border-collapse:collapse;font-size:14px;color:#6e6e73">
    ${vrstice
      .map(
        ([kljuc, vrednost]) =>
          `<tr><td style="padding:2px 16px 2px 0">${escapeHtml(kljuc)}</td><td style="padding:2px 0;color:#1d1d1f">${escapeHtml(vrednost)}</td></tr>`,
      )
      .join("")}
  </table>
</div>`;

  const result = await sendEmail({
    to: recipient,
    subject: `${appName} - prijava napake: ${summary}`,
    html,
    text,
    // Odgovor gre prijavitelju in ne na klubski nabiralnik, da se da vprašati
    // za podrobnosti kar z odgovorom na sporočilo.
    replyTo: user?.email ?? null,
    attachments,
  });

  if (!result.success) {
    console.error("Prijave napake ni bilo mogoče poslati", result.error);
    return {
      error: "Sporočila ni bilo mogoče poslati. Poskusi znova čez nekaj trenutkov.",
    };
  }

  return { success: "Prijava je poslana. Hvala!" };
}
