import { formatDate } from "@/lib/format";
import type { Member } from "@/types/app";

type EmailFields = Pick<Member, "email" | "email_bounced" | "email_bounced_at" | "email_bounce_reason">;

function bounceTitle(member: EmailFields) {
  const when = member.email_bounced_at ? ` (${formatDate(member.email_bounced_at)})` : "";
  const reason = member.email_bounce_reason ? ` - ${member.email_bounce_reason}` : "";
  return `E-naslov ne deluje, pošta se vrača${when}${reason}. Obvestila mu ne gredo.`;
}

/**
 * Rdeča pika ob e-naslovu, s katerega se je pošta vrnila. Obvestila takega
 * člana preskočijo; ob naslednjem obisku ga vprašajte za pravi naslov.
 */
export function BouncedDot({ member }: { member: EmailFields }) {
  if (!member.email || !member.email_bounced) {
    return null;
  }

  const title = bounceTitle(member);

  return (
    <span
      title={title}
      aria-label={title}
      role="img"
      className="inline-block size-2 shrink-0 rounded-full bg-destructive"
    />
  );
}

/** E-naslov z morebitno rdečo piko, za sezname in kartice. */
export function MemberEmail({ member }: { member: EmailFields }) {
  return (
    <span className="inline-flex max-w-full items-center gap-1.5">
      <BouncedDot member={member} />
      <span
        className={member.email_bounced ? "truncate text-destructive" : "truncate"}
        title={member.email ?? undefined}
      >
        {member.email || "Ni e-pošte"}
      </span>
    </span>
  );
}
