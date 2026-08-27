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
 * Sestavi e-pošto obvestila. Postavitev sloni na tabelah in vrstičnih slogih,
 * ker Gmail in Outlook odstranita <style> v glavi in ne poznata flexboxa.
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
  const safeContent = sanitizeRichText(contentHtml);

  // Odstavki iz urejevalnika pridejo brez slogov; tipografijo dodamo tu, da je
  // ista v e-pošti in v predogledu.
  const styledContent = safeContent
    .replace(
      /<p>/g,
      '<p style="margin:0 0 18px 0;font-size:16px;line-height:1.65;color:#1d1d1f;">',
    )
    .replace(
      /<h2>/g,
      '<h2 style="margin:28px 0 12px 0;font-size:21px;line-height:1.3;color:#1d1d1f;letter-spacing:-0.02em;">',
    )
    .replace(
      /<h3>/g,
      '<h3 style="margin:24px 0 10px 0;font-size:18px;line-height:1.35;color:#1d1d1f;letter-spacing:-0.015em;">',
    )
    .replace(
      /<ul>/g,
      '<ul style="margin:0 0 18px 0;padding-left:22px;font-size:16px;line-height:1.65;color:#1d1d1f;">',
    )
    .replace(
      /<ol>/g,
      '<ol style="margin:0 0 18px 0;padding-left:22px;font-size:16px;line-height:1.65;color:#1d1d1f;">',
    )
    .replace(/<li>/g, '<li style="margin:0 0 8px 0;">')
    .replace(
      /<blockquote>/g,
      '<blockquote style="margin:0 0 18px 0;padding:12px 18px;border-left:3px solid #f36717;background-color:#fdf3ec;font-size:16px;line-height:1.6;color:#1d1d1f;">',
    );

  const greeting = recipientName
    ? `<p style="margin:0 0 18px 0;font-size:16px;line-height:1.65;color:#1d1d1f;">Živjo ${escapeHtml(
        recipientName,
      )},</p>`
    : "";

  const ctaBlock =
    ctaLabel && ctaUrl
      ? `<table role="presentation" cellspacing="0" cellpadding="0" style="margin:28px 0 6px 0;">
            <tr>
              <td style="border-radius:999px;background-color:#f36717;">
                <a href="${escapeHtml(ctaUrl)}" style="display:inline-block;padding:14px 30px;font-size:16px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:999px;">${escapeHtml(
                  ctaLabel,
                )}</a>
              </td>
            </tr>
          </table>`
      : "";

  const subtitleBlock = subtitle
    ? `<p style="margin:8px 0 0 0;font-size:15px;line-height:1.4;color:#ffffff;opacity:0.92;">${escapeHtml(
        subtitle,
      )}</p>`
    : "";

  const typeBlock =
    campaignType !== "obvestilo"
      ? `<p style="margin:0 0 14px 0;font-size:12px;font-weight:bold;letter-spacing:0.16em;text-transform:uppercase;color:#f36717;">${escapeHtml(
          campaignTypeLabels[campaignType],
        )}</p>`
      : "";

  const navLinks = club.links
    .map(
      (link) =>
        `<a href="${link.href}" style="color:#6e6e73;text-decoration:none;margin:0 8px;">${link.label}</a>`,
    )
    .join('<span style="color:#d2d2d7;">&bull;</span>');

  const socialLinks = club.social
    .map(
      (link) =>
        `<a href="${link.href}" style="display:inline-block;margin:0 6px;padding:8px 16px;border:1px solid #d2d2d7;border-radius:999px;color:#1d1d1f;text-decoration:none;font-size:13px;">${link.label}</a>`,
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
            <td style="background-color:#f36717;padding:22px 32px;text-align:center;">
              <p style="margin:0;font-size:12px;font-weight:bold;letter-spacing:0.18em;text-transform:uppercase;color:#ffffff;">
                ${club.name}
              </p>
              ${subtitleBlock}
            </td>
          </tr>

          <tr>
            <td style="padding:34px 32px 8px 32px;">
              ${typeBlock}
              <h1 style="margin:0;font-size:27px;line-height:1.25;color:#1d1d1f;letter-spacing:-0.02em;">
                ${escapeHtml(title)}
              </h1>
            </td>
          </tr>

          <tr>
            <td style="padding:22px 32px 30px 32px;">
              ${greeting}
              ${styledContent}
              ${ctaBlock}
              <p style="margin:26px 0 0 0;font-size:16px;line-height:1.65;color:#1d1d1f;">
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
            <td style="padding:24px 32px 8px 32px;text-align:center;">
              ${socialLinks}
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
