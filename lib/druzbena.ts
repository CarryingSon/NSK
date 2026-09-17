/**
 * Objave z Instagrama in Facebooka za naslovnico.
 *
 * Namerno jih poberemo na strežniku in izrišemo sami, namesto da bi vgradili
 * Metine vtičnike: obiskovalec tako ne dobi njihovih piškotkov (in stran ne
 * potrebuje pasice o privolitvi), izris pa se drži našega dizajna.
 *
 * Priklop na Meto še čaka na dostope. Instagram Basic Display API je
 * 4. decembra 2024 ugasnil, zato bo šlo prek Instagram Graph API, ta pa
 * zahteva profesionalni profil in žeton z veljavnostjo 60 dni. Dokler
 * nastavitev ni, vrne ta modul prazen seznam in razdelek pokaže povabilo
 * na profila - nikoli prazne luknje.
 */

export type Omrezje = "instagram" | "facebook";

export type DruzbenaObjava = {
  id: string;
  omrezje: Omrezje;
  besedilo: string;
  slika: string | null;
  povezava: string;
  objavljeno: string;
};

export function jeDruzbenaPovezavaNastavljena() {
  return Boolean(process.env.META_ACCESS_TOKEN && process.env.META_IG_USER_ID);
}

export async function pridobiDruzbeneObjave(): Promise<DruzbenaObjava[]> {
  if (!jeDruzbenaPovezavaNastavljena()) {
    return [];
  }

  // TODO: klic na Instagram Graph API in Facebook Page feed, rezultat pa se
  // shrani v Supabase, da izpad Mete ne izprazni naslovnice.
  return [];
}
