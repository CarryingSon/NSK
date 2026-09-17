/**
 * Podatki kluba, ki jih javna stran izpisuje na več mestih.
 *
 * Vse je tu in ne v posameznih straneh, ker se naslov, uradne ure in vodstvo
 * pojavljajo v nogi, na kontaktu in v strukturiranih podatkih za iskalnike -
 * trije prepisi istega naslova se prej ali slej razidejo.
 */

export const klub = {
  ime: "Notranjski študentski klub",
  kratica: "NŠK",
  naslov: {
    ulica: "Gerbičeva ulica 32",
    posta: "1380 Cerknica",
    obcina: "Cerknica",
    drzava: "SI",
  },
  email: "nsk.klub@gmail.com",
  telefon: "041 301 244",
  // Za tel: povezavo; v besedilu ostane zapis s presledki.
  telefonUrl: "+38641301244",
  uradneUre: "petek 18.00 - 20.00",
  davcna: "96005564",
  maticna: "5737877000",
  trr: "SI56 0400 0027 8210 006",
  obcine: ["Cerknica", "Loška Dolina", "Bloke"],
  druzbena: {
    instagram: "https://www.instagram.com/nsk_klub/",
    facebook: "https://www.facebook.com/klub.nsk/",
  },
} as const;

export const upravniOdbor = [
  { ime: "Liza Perko", funkcija: "Predsednica", email: "lizaperko.nsk@gmail.com" },
  { ime: "Juna Jesenšek", funkcija: "Podpredsednica" },
  { ime: "Hana Jesenšek", funkcija: "Tajnica" },
  { ime: "Nikita Čuček", funkcija: "Svetnica" },
  { ime: "Luka Petavs", funkcija: "Blagajničar" },
  { ime: "Neža Horvat", funkcija: "Predstavnica dijaške sekcije" },
] as const;

export const nadzorniOdbor = [
  { ime: "Miha Prudič" },
  { ime: "Ambrož Puntar" },
  { ime: "David Tomšič" },
] as const;

export const partnerji = [
  {
    ime: "Zveza študentskih klubov Slovenije",
    url: "https://skis-zveza.si/",
    logo: "/stran/partnerji/skis.png",
  },
  {
    ime: "Študentska organizacija Slovenije",
    url: "https://www.studentska-org.si/",
    logo: "/stran/partnerji/sos.png",
  },
  {
    ime: "Občina Cerknica",
    url: "https://www.cerknica.si/",
    logo: "/stran/partnerji/cerknica.png",
  },
  {
    ime: "Zalteh",
    url: "https://www.zalteh.si/",
    logo: "/stran/partnerji/zalteh.jpg",
  },
] as const;

/** Tri področja delovanja kluba; nosijo naslovnico in stran o klubu. */
export const podrocja = [
  {
    naslov: "Zabava",
    opis: "Koncerti, žuri in dogodki, ki držijo Notranjsko pokonci vse leto.",
    slika: "/stran/hero/zabava.jpg",
  },
  {
    naslov: "Šport",
    opis: "Brezplačna rekreacija, turnirji in vadbe po ugodnejših cenah.",
    slika: "/stran/hero/sport.jpg",
  },
  {
    naslov: "Kultura in izobraževanje",
    opis: "Predavanja, delavnice in projekti, ki dajo več kot predavalnica.",
    slika: "/stran/hero/kultura.jpg",
  },
] as const;

export const ugodnosti = [
  "Brezplačne športne aktivnosti v Športni dvorani Cerknica (vsak petek, 21.00 - 22.30)",
  "Brezplačni ogledi filmov in cenejše vstopnice za predstave v KD Cerknica",
  "Brezplačna članarina v Knjižnici Jožeta Udoviča, Cerknica",
  "Brezplačen tisk gradiva na Uckanci",
  "Cenejše vstopnice za vse dogodke v organizaciji NŠK",
  "Popust na vadbe pilatesa pri Ireni Skuk",
  "Ugodnejši tečaji in vadbe v PK Evora",
  "Ugodnejše vadbe v vadbenem centru Olimp",
  "20 % popust na vse storitve pri Manus Sergej",
  "20 % popust pri popravilu koles v Bike centru Cerknica",
] as const;

/** Klubsko glasilo. Stare številke so na voljo kot PDF. */
export const heksnsus = [
  { naslov: "Heksnšus zima 2021", datoteka: "heksnsus-zima-2021.pdf" },
  { naslov: "Heksnšus zima 2020", datoteka: "heksnsus-zima-2020.pdf" },
  { naslov: "Heksnšus zima 2019", datoteka: "heksnsus-zima-2019.pdf" },
] as const;

/** Trije sklopi, v katere stara stran razvršča ugodnosti. */
export const sklopiUgodnosti = [
  { naslov: "Popusti", opis: "Ekskluzivni popusti pri partnerjih kluba" },
  { naslov: "Dogodki", opis: "Prednostni dostop do klubskih dogodkov" },
  { naslov: "Privilegiji", opis: "Posebne ugodnosti in ekskluzivne ponudbe" },
] as const;

type Dokument = {
  naslov: string;
  datoteka: string;
};

export const dokumenti: { skupina: string; vsebina: Dokument[] }[] = [
  {
    skupina: "Temeljni akt",
    vsebina: [{ naslov: "Statut kluba", datoteka: "statut-kluba.pdf" }],
  },
  {
    skupina: "Pravilniki",
    vsebina: [
      {
        naslov: "Volilni pravilnik za volitve organov NŠK",
        datoteka: "volilni-pravilnik-organi-nsk.pdf",
      },
      { naslov: "Pravilnik o nabavi", datoteka: "pravilnik-o-nabavi.pdf" },
      { naslov: "Pravilnik o honorarjih", datoteka: "pravilnik-o-honorarjih.pdf" },
      {
        naslov: "Katalog informacij javnega značaja",
        datoteka: "katalog-informacij-javnega-znacaja.pdf",
      },
      {
        naslov:
          "Pravilnik o ohranitvi in izgubi statusa organizacijske oblike ŠOS za ŠOLS ŠU-4",
        datoteka: "pravilnik-status-organizacijske-oblike.pdf",
      },
      {
        naslov: "Pravilnik o ustanavljanju novih organizacijskih oblik ŠOS",
        datoteka: "pravilnik-ustanavljanje-organizacijskih-oblik.pdf",
      },
      {
        naslov: "Volilni pravilnik za volitve svetnikov sveta ŠOLS",
        datoteka: "volilni-pravilnik-svetniki-sols.pdf",
      },
      { naslov: "Študentska ustava", datoteka: "studentska-ustava.pdf" },
      {
        naslov: "Pravilnik o finančnem načrtu",
        datoteka: "pravilnik-o-financnem-nacrtu.pdf",
      },
      {
        naslov: "Pravilnik o varovanju osebnih podatkov",
        datoteka: "pravilnik-o-varovanju-osebnih-podatkov.pdf",
      },
    ],
  },
  {
    skupina: "Dokumenti",
    vsebina: [
      {
        naslov: "Kriteriji kakovosti delovanja klubov 2023",
        datoteka: "kriteriji-kakovosti-2023.pdf",
      },
      {
        naslov: "Politika zasebnosti in pravna obvestila",
        datoteka: "politika-zasebnosti.pdf",
      },
    ],
  },
];
