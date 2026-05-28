import "server-only";

import nodemailer from "nodemailer";

import { getEmailCredentials } from "@/lib/supabase/env";

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
  });

  return transporter;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function buildNotificationEmailHtml({
  subject,
  body,
}: {
  subject: string;
  body: string;
}) {
  const formattedBody = escapeHtml(body)
    .split("\n\n")
    .map((paragraph) => paragraph.replaceAll("\n", "<br />"))
    .map(
      (paragraph) =>
        `<p style="margin: 0 0 18px 0; font-size: 16px; line-height: 1.65; color: #3b4350;">${paragraph}</p>`,
    )
    .join("");

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f6f4ed; font-family: Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f6f4ed;">
    <tr>
      <td align="center" style="padding: 32px 16px;">
        <table role="presentation" width="640" cellspacing="0" cellpadding="0" style="max-width: 640px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 35px rgba(24, 33, 104, 0.10);">
          <tr>
            <td style="background: linear-gradient(135deg, #f36717 0%, #182168 100%); padding: 24px 32px; text-align: center;">
              <p style="margin: 0; font-size: 13px; font-weight: bold; letter-spacing: 0.24em; text-transform: uppercase; color: rgba(255,255,255,0.72);">
                Notranjski študentski klub
              </p>
              <h1 style="margin: 14px 0 0 0; font-size: 30px; line-height: 1.2; color: #ffffff;">
                ${escapeHtml(subject)}
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px;">
              ${formattedBody}
            </td>
          </tr>
          <tr>
            <td style="background-color: #fff8f3; border-top: 1px solid #f2e6dc; padding: 20px 32px;">
              <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #5f6774;">
                Lep pozdrav,<br />
                <strong style="color: #182168;">Ekipa NŠK</strong>
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
