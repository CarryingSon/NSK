import "server-only";

import nodemailer from "nodemailer";

import { campaignTypeLabels, club } from "@/lib/constants";
import { escapeHtml, sanitizeRichText } from "@/lib/email-content";
import { getEmailCredentials } from "@/lib/supabase/env";
import type { CampaignType } from "@/types/database";

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (transporter) {
    return transporter;
  }

  const credentials = getEmailCredentials();

  transporter = nodemailer.createTransport({
    host: credentials.smtpHost,
    port: credentials.smtpPort,
    secure: credentials.smtpSecure,
    auth: {
      user: credentials.smtpUser,
      pass: credentials.smtpPass,
    },
    // Ena povezava, več sporočil: pri seriji dvajsetih to prihrani dvajset
    // TLS rokovanj in Gmailu prepreči, da bi sunek prepoznal kot zlorabo.
    pool: true,
    maxConnections: 1,
    maxMessages: 50,
  });

  return transporter;
}

export interface CampaignEmailContent {
  title: string;
  subtitle?: string | null;
  contentHtml: string;
  ctaLabel?: string | null;
  ctaUrl?: string | null;
  campaignType?: CampaignType;
  recipientName?: string | null;
}

/**
 * Osnova za slike v e-pošti. Relativne poti v e-pošti ne delujejo - odjemalec
 * sporočila nima pojma, s katerega gostitelja prihaja - zato morajo biti
 * naslovi absolutni in javno dosegljivi.
 */
function getAssetBaseUrl() {
  const explicit = process.env.NEXT_PUBLIC_APP_URL?.trim();

  if (explicit) {
    return explicit.replace(/\/$/, "");
  }

  const vercelDomain = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();

  if (vercelDomain) {
    return `https://${vercelDomain}`;
  }

  return "https://nsk-rust.vercel.app";
}

/**
 * Sestavi e-pošto obvestila. Postavitev sloni na tabelah in vrstičnih slogih,
 * ker Gmail in Outlook odstranita <style> v glavi in ne poznata flexboxa.
 * Vse je sredinsko poravnano, logotip pa stoji nad oranžnim pasom.
 */
export function buildCampaignEmailHtml({
  title,
  subtitle,
  contentHtml,
  ctaLabel,
  ctaUrl,
  campaignType = "obvestilo",
  recipientName,
}: CampaignEmailContent) {
  const assets = getAssetBaseUrl();
  const safeContent = sanitizeRichText(contentHtml);

  // Odstavki iz urejevalnika pridejo brez slogov; tipografijo dodamo tu, da je
  // ista v e-pošti in v predogledu. Seznami ostanejo brez pik: sredinsko
  // poravnane alineje z vodilnimi pikami izpadejo razmetano.
  const styledContent = safeContent
    .replace(
      /<p>/g,
      '<p style="margin:0 0 18px 0;font-size:16px;line-height:1.65;color:#1d1d1f;text-align:center;">',
    )
    .replace(
      /<h2>/g,
      '<h2 style="margin:30px 0 12px 0;font-size:22px;line-height:1.3;color:#1d1d1f;letter-spacing:-0.02em;text-align:center;">',
    )
    .replace(
      /<h3>/g,
      '<h3 style="margin:24px 0 10px 0;font-size:18px;line-height:1.35;color:#1d1d1f;letter-spacing:-0.015em;text-align:center;">',
    )
    .replace(
      /<ul>/g,
      '<ul style="margin:0 0 18px 0;padding:0;list-style:none;font-size:16px;line-height:1.65;color:#1d1d1f;text-align:center;">',
    )
    .replace(
      /<ol>/g,
      '<ol style="margin:0 0 18px 0;padding:0;list-style:none;font-size:16px;line-height:1.65;color:#1d1d1f;text-align:center;">',
    )
    .replace(/<li>/g, '<li style="margin:0 0 8px 0;">')
    .replace(
      /<blockquote>/g,
      '<blockquote style="margin:0 0 18px 0;padding:14px 20px;background-color:#fdf3ec;border-radius:12px;font-size:16px;line-height:1.6;color:#1d1d1f;text-align:center;">',
    )
    .replace(
      /<img /g,
      '<img align="center" ',
    );

  const greeting = recipientName
    ? `<p style="margin:0 0 18px 0;font-size:16px;line-height:1.65;color:#1d1d1f;text-align:center;">Živjo ${escapeHtml(
        recipientName,
      )},</p>`
    : "";

  const ctaBlock =
    ctaLabel && ctaUrl
      ? `<table role="presentation" cellspacing="0" cellpadding="0" align="center" style="margin:30px auto 6px auto;">
            <tr>
              <td style="border-radius:999px;background-color:#f36717;">
                <a href="${escapeHtml(ctaUrl)}" style="display:inline-block;padding:15px 34px;font-size:16px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:999px;">${escapeHtml(
                  ctaLabel,
                )}</a>
              </td>
            </tr>
          </table>`
      : "";

  // Brez podnaslova pas ostane kot tanka oranžna črta - klubska barva mora
  // ostati vidna tudi pri sporočilu brez njega.
  const bannerRow = subtitle
    ? `<tr>
            <td style="background-color:#f36717;padding:14px 32px;text-align:center;">
              <p style="margin:0;font-size:15px;line-height:1.45;font-weight:600;color:#ffffff;">${escapeHtml(
                subtitle,
              )}</p>
            </td>
          </tr>`
    : `<tr>
            <td style="background-color:#f36717;height:6px;line-height:6px;font-size:0;">&nbsp;</td>
          </tr>`;

  const typeBlock =
    campaignType !== "obvestilo"
      ? `<p style="margin:0 0 14px 0;font-size:12px;font-weight:bold;letter-spacing:0.16em;text-transform:uppercase;color:#f36717;text-align:center;">${escapeHtml(
          campaignTypeLabels[campaignType],
        )}</p>`
      : "";

  const navLinks = club.links
    .map(
      (link) =>
        `<a href="${link.href}" style="color:#6e6e73;text-decoration:none;margin:0 8px;">${link.label}</a>`,
    )
    .join('<span style="color:#d2d2d7;">&bull;</span>');

  // Ikone so slike v tabeli, ne flex - poštni odjemalci flexboxa ne poznajo.
  const socialIcons = club.social
    .map(
      (link) =>
        `<td style="padding:0 7px;">
                    <a href="${link.href}" style="text-decoration:none;">
                      <img src="${assets}/email/${link.icon}.png" width="36" height="36" alt="${link.label}" style="display:block;width:36px;height:36px;border:0;border-radius:999px;" />
                    </a>
                  </td>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="sl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:0;background-color:#fdfaf4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(
    subtitle || title,
  )}</div>

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#fdfaf4;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;background-color:#ffffff;border:1px solid #eadfd2;border-radius:18px;overflow:hidden;">

          <tr>
            <td style="padding:30px 32px 24px 32px;text-align:center;">
              <a href="${club.website}" style="text-decoration:none;">
                <img src="${assets}/email/nsk-logo.png" width="260" alt="${club.name}" style="display:inline-block;width:260px;max-width:80%;height:auto;border:0;" />
              </a>
            </td>
          </tr>

          ${bannerRow}

          <tr>
            <td style="padding:36px 32px 8px 32px;text-align:center;">
              ${typeBlock}
              <h1 style="margin:0;font-size:34px;line-height:1.18;color:#1d1d1f;letter-spacing:-0.025em;font-weight:700;">
                ${escapeHtml(title)}
              </h1>
            </td>
          </tr>

          <tr>
            <td style="padding:24px 40px 34px 40px;text-align:center;">
              ${greeting}
              ${styledContent}
              ${ctaBlock}
              <p style="margin:30px 0 0 0;font-size:16px;line-height:1.65;color:#1d1d1f;text-align:center;">
                Lep pozdrav,<br />
                <strong>Ekipa ${club.shortName}</strong>
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:0 32px;">
              <div style="height:1px;background-color:#eadfd2;"></div>
            </td>
          </tr>

          <tr>
            <td style="padding:26px 32px 10px 32px;text-align:center;">
              <table role="presentation" cellspacing="0" cellpadding="0" align="center" style="margin:0 auto;">
                <tr>
                  ${socialIcons}
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:14px 32px 6px 32px;text-align:center;font-size:13px;">
              ${navLinks}
            </td>
          </tr>

          <tr>
            <td style="padding:16px 32px 30px 32px;text-align:center;">
              <p style="margin:0;font-size:13px;line-height:1.7;color:#6e6e73;">
                <strong style="color:#1d1d1f;">${club.name}</strong><br />
                ${club.street}, ${club.city}<br />
                <a href="mailto:${club.email}" style="color:#f36717;text-decoration:none;">${club.email}</a>
                &nbsp;&bull;&nbsp;
                <a href="${club.phoneHref}" style="color:#f36717;text-decoration:none;">${club.phone}</a><br />
                <a href="${club.website}" style="color:#6e6e73;text-decoration:none;">${club.website.replace(
                  "https://",
                  "",
                )}</a>
              </p>
              <p style="margin:16px 0 0 0;font-size:12px;line-height:1.6;color:#a1a1a6;">
                To sporočilo si prejel_a kot član_ica ${club.shortName}.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text: string;
}) {
  try {
    const mailer = getTransporter();
    const credentials = getEmailCredentials();

    await mailer.sendMail({
      from: credentials.smtpFrom,
      replyTo: credentials.smtpReplyTo,
      to,
      subject,
      html,
      text,
    });

    return {
      success: true,
    } as const;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Pošiljanje ni uspelo.",
    } as const;
  }
}
