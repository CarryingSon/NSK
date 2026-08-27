import "server-only";

/**
 * Javni naslov aplikacije.
 *
 * Potrebujeta ga dve mesti, ki ju relativna pot ne reši: slike v e-pošti (poštni
 * odjemalec nima gostitelja, na katerega bi jih vezal) in koda za vgradnjo
 * obrazca (teče na tuji spletni strani).
 */
export function getSiteUrl() {
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
