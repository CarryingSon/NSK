import type { MembershipApplication } from "@/types/app";

/**
 * Stanje prijave v sistem študentskih klubov.
 *
 * Posredovanje sproži odobritev prijave in namenoma ne podre odobritve, kadar
 * je tuj sistem nedosegljiv. Brez tega prikaza bi bila taka napaka nevidna -
 * klub bi mislil, da je član zaveden, pa ne bi bil.
 */
export function SosStatus({
  application,
}: {
  application: Pick<
    MembershipApplication,
    | "status"
    | "terms_accepted"
    | "notifications_accepted"
    | "sos_registered_at"
    | "sos_error"
  >;
}) {
  if (application.sos_registered_at) {
    return (
      <p className="mt-1 text-xs text-success">
        ŠOS: prijavljen, čaka potrditev kode
      </p>
    );
  }

  if (application.sos_error) {
    return (
      <p
        className="mt-1 text-xs text-destructive"
        title={`${application.sos_error} — za ponoven poskus vrni prijavo v obdelavo in jo znova odobri.`}
      >
        ŠOS: pošiljanje ni uspelo
      </p>
    );
  }

  if (!application.terms_accepted || !application.notifications_accepted) {
    return (
      <p className="mt-1 text-xs text-muted-foreground">ŠOS: brez soglasja</p>
    );
  }

  // Soglasji sta dani, prijava pa še čaka - povej, kaj bo odobritev sprožila.
  if (application.status === "pending") {
    return (
      <p className="mt-1 text-xs text-muted-foreground">ŠOS: ob odobritvi</p>
    );
  }

  return null;
}
