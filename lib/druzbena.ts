/**
 * Naslova vgradnih vtičnikov za Instagram in Facebook.
 *
 * Objav ne pobiramo sami. Instagram Basic Display API je 4. decembra 2024
 * ugasnil, njegov naslednik (Instagram Graph API) pa zahteva profesionalni
 * profil in žeton s 60-dnevno veljavnostjo, ki ga je treba redno obnavljati.
 * Dokler kluba to ne pridobi in dokler ni razloga za izris po meri, je
 * vgradnja uradnega vtičnika edino, kar dela takoj in samo od sebe ostaja
 * sveže: objave postreže omrežje, mi pa le odmerimo prostor.
 *
 * Oba vtičnika sta javna in ne zahtevata ne žetona ne prijave obiskovalca.
 */

import { klub } from "@/lib/klub";

/** Pod to širino se Facebookov vtičnik ne skrči več. */
export const NAJOZJI_VTICNIK = 180;

/** Nad to širino se noben od vtičnikov ne razširi, zato je okvir tu odrezan. */
export const NAJSIRSI_VTICNIK = 500;

/**
 * Višina vgradnje pri dani širini.
 *
 * Instagram pokaže glavo profila in dve vrsti po tri kvadratne objave, zato
 * njegova višina raste s širino: dve tretjini širine gre za mrežo, ostalo je
 * glava in gumb pod njo. Izmerjeno pri 320, 360, 400, 450 in 500 px; pribitek
 * je postavljen tako, da pri nobeni od teh širin ni odrezana zadnja vrsta.
 *
 * Facebook izriše celotno časovnico ne glede na to, kaj mu naročimo, in jo
 * okvir odreže - njegovo višino torej lahko poravnamo z Instagramovo, da sta
 * kartici ob sebi enako visoki. Koliko objav je vidnih, določi ta odrez.
 */
export function visinaVgradnje(sirina: number) {
  return Math.round((sirina * 2) / 3) + 225;
}

/**
 * Facebookova stranska časovnica.
 *
 * Parametri so isti kot na stari strani, da je izris enak: brez skrčene
 * glave, z naslovnico in s sledilci.
 *
 * Širino mu je treba povedati. `adapt_container_width` drži samo pri vgradnji
 * prek Metinega JS SDK; v golem okvirju vtičnik ostane širok toliko, kolikor
 * pove `width`, in na telefonu odreže desno tretjino. Tudi stara stran je
 * zato širino računala sproti.
 */
export function facebookVticnik(sirina: number, visina: number) {
  const naslov = new URL("https://www.facebook.com/plugins/page.php");
  naslov.searchParams.set("href", klub.druzbena.facebook);
  naslov.searchParams.set("tabs", "timeline");
  naslov.searchParams.set("width", String(sirina));
  naslov.searchParams.set("height", String(visina));
  naslov.searchParams.set("adapt_container_width", "true");
  naslov.searchParams.set("small_header", "false");
  naslov.searchParams.set("hide_cover", "false");
  naslov.searchParams.set("show_facepile", "true");
  naslov.searchParams.set("locale", "sl_SI");
  return naslov.toString();
}

/**
 * Instagramov profilni vtičnik: glava profila in mreža zadnjih šestih objav.
 *
 * Naslov je profil s končnico `embed/`. Vtičnik nima nastavitev - koliko
 * objav pokaže, določa Instagram sam, širini okvirja pa se prilagodi sam od
 * sebe, zato mu je ni treba povedati.
 */
export function instagramVticnik() {
  // Konstanta se konča s poševnico, a se lahko kdaj popravi; zato je pot
  // sestavljena tako, da je poševnica natanko ena.
  return `${klub.druzbena.instagram.replace(/\/+$/, "")}/embed/`;
}
