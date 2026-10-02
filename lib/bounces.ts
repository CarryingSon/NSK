import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { ImapFlow } from "imapflow";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getEmailCredentials } from "@/lib/supabase/env";
import type { Database } from "@/types/database";

type AnySupabase = SupabaseClient<Database>;

/**
 * Nedostavljiva pošta (bounce).
 *
 * Gmail sporočilo ob pošiljanju vedno sprejme; če prejemnikov strežnik naslov
 * zavrne, pride nekaj minut pozneje na klubski naslov povratnica od
 * "Mail Delivery Subsystem". Edini zanesljiv vir je torej nabiralnik, ki ga tu
 * beremo prek IMAP - samo za branje, ničesar ne označimo in ne premaknemo.
 */

// Koliko nazaj pogledamo. Pregled teče enkrat na dan in še na zahtevo, zato
// nekaj dni prekrivanja ne škodi: označevanje je idempotentno.
const lookbackDays = 4;

export interface BounceHit {
  email: string;
  reason: string;
  at: Date;
}

/** Iz surove povratnice (RFC 3464) izlušči trajno zavrnjene prejemnike. */
export function parseDeliveryReport(source: string): Omit<BounceHit, "at">[] {
  const hits: Omit<BounceHit, "at">[] = [];
  // Odstavki poročila so ločeni s prazno vrstico; vsak prejemnik ima svojega.
  const blocks = source.replace(/\r\n/g, "\n").split(/\n\s*\n/);

  for (const block of blocks) {
    const recipient = /^Final-Recipient:\s*rfc822;\s*<?([^\s>]+@[^\s>]+)>?/im.exec(block);
    if (!recipient) continue;

    const action = /^Action:\s*(\S+)/im.exec(block)?.[1]?.toLowerCase();
    const status = /^Status:\s*(\d)\.\d+\.\d+/im.exec(block)?.[1];

    // Samo trajne napake. "delayed" in 4.x.x pomenita, da Gmail še poskuša.
    if (action !== "failed" || status !== "5") continue;

    // Razlog se lahko nadaljuje v vrsticah, ki se začnejo s presledkom.
    const diagnostic = /^Diagnostic-Code:\s*(?:smtp;\s*)?(.*(?:\n[ \t].*)*)/im
      .exec(block)?.[1]
      ?.replace(/\s+/g, " ")
      .trim();

    hits.push({
      email: recipient[1].toLowerCase(),
      reason: (diagnostic || `Status ${status}`).slice(0, 300),
    });
  }

  return hits;
}

/**
 * Označi člana z naslovom kot nedosegljivega.
 *
 * Povratnice, starejše od ročne odstranitve oznake, preskočimo - drugače bi
 * pregled oznako postavil nazaj takoj, ko jo je nekdo umaknil.
 */
export async function markEmailBounced(
  supabase: AnySupabase,
  hit: BounceHit,
) {
  // ilike brez nadomestnih znakov = primerjava brez razlike med velikimi in
  // malimi črkami. Znaka % in _ v naslovu ubežimo.
  const pattern = hit.email.replace(/[\\%_]/g, (char) => `\\${char}`);

  const { data: members } = await supabase
    .from("members")
    .select("id, email_bounced, email_bounce_cleared_at")
    .ilike("email", pattern);

  const targets = (members ?? []).filter(
    (member) =>
      !member.email_bounced &&
      (!member.email_bounce_cleared_at ||
        new Date(member.email_bounce_cleared_at) < hit.at),
  );

  if (targets.length === 0) {
    return 0;
  }

  await supabase
    .from("members")
    .update({
      email_bounced: true,
      email_bounced_at: hit.at.toISOString(),
      email_bounce_reason: hit.reason,
    })
    .in(
      "id",
      targets.map((member) => member.id),
    );

  return targets.length;
}

function getImapConfig() {
  const smtp = getEmailCredentials();

  return {
    // Za Gmail je imap.gmail.com; drugje praviloma smtp. -> imap.
    host: process.env.IMAP_HOST || smtp.smtpHost.replace(/^smtp\./, "imap."),
    port: Number(process.env.IMAP_PORT || 993),
    user: process.env.IMAP_USER || smtp.smtpUser,
    pass: process.env.IMAP_PASS || smtp.smtpPass,
  };
}

/** Prebere povratnice zadnjih dni in označi člane. Vrne število označenih. */
export async function checkMailboxForBounces() {
  const config = getImapConfig();
  const client = new ImapFlow({
    host: config.host,
    port: config.port,
    secure: true,
    auth: { user: config.user, pass: config.pass },
    logger: false,
  });

  const hits: BounceHit[] = [];

  await client.connect();

  try {
    const lock = await client.getMailboxLock("INBOX", { readOnly: true });

    try {
      const since = new Date(Date.now() - lookbackDays * 24 * 60 * 60 * 1000);
      const uids = await client.search(
        {
          since,
          or: [{ from: "mailer-daemon" }, { from: "postmaster" }],
        },
        { uid: true },
      );

      if (uids && uids.length > 0) {
        for await (const message of client.fetch(
          uids,
          { source: true, internalDate: true },
          { uid: true },
        )) {
          if (!message.source) continue;

          const at =
            message.internalDate instanceof Date
              ? message.internalDate
              : new Date(message.internalDate ?? Date.now());

          for (const hit of parseDeliveryReport(message.source.toString("utf8"))) {
            hits.push({ ...hit, at });
          }
        }
      }
    } finally {
      lock.release();
    }
  } finally {
    await client.logout().catch(() => undefined);
  }

  const supabase = createSupabaseAdminClient();
  let marked = 0;

  for (const hit of hits) {
    marked += await markEmailBounced(supabase, hit);
  }

  return { reports: hits.length, marked };
}
