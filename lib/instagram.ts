/**
 * Ocena, ali objava na Instagramu oznanja dogodek.
 *
 * Namenoma brez jezikovnega modela: objav je malo, zahteva je skromna in
 * seznam uteži je nekaj, kar lahko kdorkoli prebere in popravi. Ocena bo
 * včasih zgrešila - zato ima nadzorna plošča ročni preklop za vsako objavo,
 * ocena pa le predlaga privzeto stanje.
 *
 * Vse uteži in prag so zbrani tu zgoraj. Če se na stran prebija preveč
 * objav, dvigni PRAG; če jih pade skozi premalo, ga spusti.
 */

const PRAG = 4;

/** Objave s tako kratkim opisom so v praksi slika brez sporočila. */
const NAJKRAJSI_OPIS = 15;

const UTEZI = {
  datum: 3,
  ura: 2,
  danVTednu: 2,
  besedaDogodka: 3,
  lastnaPrireditev: 3,
  mesec: 1,
  vabilo: 2,
  prizorisce: 1,
  // Negativne: objava govori o tem, kar je bilo, ne o tem, kar bo.
  zaNazaj: -4,
  voscilo: -3,
  odpoved: -6,
} as const;

// Ujame "12.5.", "12. 5.", "12.5.2026" in "12. 5. 2026".
const VZOREC_DATUMA = /\b\d{1,2}\.\s?\d{1,2}\.(\s?\d{2,4})?/;

// Ujame "ob 21h", "21:00", "ob 20.30", "21.00".
const VZOREC_URE = /\b(ob\s*)?\d{1,2}([:.]\d{2}|\s*h\b|\s*uri\b|\s*uro\b)/;

// Koreni namesto celih besed: slovenščina sklanja, "v soboto" in "sobota" pa
// morata šteti enako. Isto velja za vse spodnje sezname.
const DNEVI = [
  "ponedelj", "torek", "tork", "sred", "cetrt", "petek", "petk", "sobot", "nedelj",
];

const BESEDE_DOGODKA = [
  "dogod", "koncert", "zur", "zabav", "turnir", "delavnic", "predavanj",
  "izlet", "festival", "fest", "karaok", "kviz", "pohod", "piknik",
  "razpis", "obcni zbor", "volitv", "sestank", "tekm", "maraton",
  "kopanj", "smucanj", "ekskurzij", "vecer", "praznovanj", "nastop",
];

const VABILA = [
  "vabljen", "vabimo", "se vidimo", "pridruz", "prijav", "vstopnic",
  "rezervacij", "kotizacij", "startnin", "prosta mesta", "zacetek ob",
  "pricakujemo", "ne zamudi", "rezerviraj",
];

const PRIZORISCA = [
  "sportn dvoran", "sportna dvorana", "kd cerknica", "zalteh", "gerbiceva",
  "cerknic", "loska dolin", "bloke", "rakek", "stari trg",
];

// Ponavljajoče se klubske prireditve. Objava o njih je napoved, tudi če je
// besedila komaj za naslov - plakat pove ostalo. Ta seznam je tisti, ki ga
// bo klub najpogosteje dopolnjeval.
const LASTNE_PRIREDITVE = [
  "veseli december", "heksnfest", "heksnsus", "zelenfest", "nsk malcki",
  "obcni zbor", "pokaz se", "smucanje osrednje regije", "skisova tura",
];

// Mesec sam po sebi ni dokaz, je pa namig - objave o dogodkih ga navajajo
// pogosteje kot objave za nazaj.
const MESECI = [
  "januar", "februar", "marec", "april", "maj", "junij", "julij",
  "avgust", "september", "oktober", "november", "december",
];

const ZA_NAZAJ = [
  "hvala", "bilo je", "vceraj", "utrink", "galerij", "smo se imeli",
  "je bilo", "smo bili", "zahvaljujemo", "poglej si kako",
];

// Odpoved je objava o dogodku, ki ga ne bo - na naslovnico med napovedi ne sodi.
const ODPOVEDI = ["odpoved", "odpade", "prestavlj", "preklic"];

const VOSCILA = [
  "vesel bozic", "srecno novo leto", "vse najboljse", "vesele praznike",
  "lep praznik", "prijeten dan", "lep vikend",
];

/**
 * Pripravi besedilo za primerjavo: male črke in šumniki brez strešic.
 *
 * Ljudje pišejo "žur" in "zur", "četrtek" in "cetrtek" - brez tega bi seznam
 * moral nositi vsako različico posebej.
 */
function poenoti(besedilo: string) {
  return besedilo
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, " ");
}

function steje(besedilo: string, izrazi: readonly string[]) {
  return izrazi.some((izraz) => besedilo.includes(izraz));
}

export type Ocena = {
  jeDogodek: boolean;
  tocke: number;
  /** Kaj je k oceni prispevalo - da se da v nadzorni plošči videti, zakaj. */
  razlogi: string[];
};

export function oceniObjavo(opis: string | null): Ocena {
  const razlogi: string[] = [];

  if (!opis || opis.trim().length < NAJKRAJSI_OPIS) {
    return { jeDogodek: false, tocke: 0, razlogi: ["opis je prekratek ali ga ni"] };
  }

  const besedilo = poenoti(opis);
  let tocke = 0;

  if (VZOREC_DATUMA.test(besedilo)) {
    tocke += UTEZI.datum;
    razlogi.push("vsebuje datum");
  }

  if (VZOREC_URE.test(besedilo)) {
    tocke += UTEZI.ura;
    razlogi.push("vsebuje uro");
  }

  if (steje(besedilo, DNEVI)) {
    tocke += UTEZI.danVTednu;
    razlogi.push("omenja dan v tednu");
  }

  if (steje(besedilo, BESEDE_DOGODKA)) {
    tocke += UTEZI.besedaDogodka;
    razlogi.push("omenja vrsto dogodka");
  }

  if (steje(besedilo, LASTNE_PRIREDITVE)) {
    tocke += UTEZI.lastnaPrireditev;
    razlogi.push("gre za znano klubsko prireditev");
  }

  if (steje(besedilo, MESECI)) {
    tocke += UTEZI.mesec;
    razlogi.push("navaja mesec");
  }

  if (steje(besedilo, VABILA)) {
    tocke += UTEZI.vabilo;
    razlogi.push("vabi k udeležbi");
  }

  if (steje(besedilo, PRIZORISCA)) {
    tocke += UTEZI.prizorisce;
    razlogi.push("omenja prizorišče");
  }

  if (steje(besedilo, ZA_NAZAJ)) {
    tocke += UTEZI.zaNazaj;
    razlogi.push("govori o že minulem");
  }

  if (steje(besedilo, ODPOVEDI)) {
    tocke += UTEZI.odpoved;
    razlogi.push("govori o odpovedi ali prestavitvi");
  }

  if (steje(besedilo, VOSCILA)) {
    tocke += UTEZI.voscilo;
    razlogi.push("je voščilo");
  }

  return { jeDogodek: tocke >= PRAG, tocke, razlogi };
}
