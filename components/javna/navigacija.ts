export type NavPovezava = {
  naslov: string;
  pot: string;
  podstrani?: { naslov: string; pot: string }[];
};

export const navigacija: NavPovezava[] = [
  { naslov: "Domov", pot: "/" },
  {
    naslov: "O NŠK",
    pot: "/o-nas",
    podstrani: [
      { naslov: "Vodstvo", pot: "/o-nas/vodstvo" },
      { naslov: "Kontakt", pot: "/o-nas/kontakt" },
      { naslov: "Skladnost", pot: "/o-nas/skladnost" },
      { naslov: "Dokumenti", pot: "/o-nas/dokumenti" },
      { naslov: "Heksnšus", pot: "/o-nas/heksnsus" },
    ],
  },
  { naslov: "Ugodnosti", pot: "/ugodnosti" },
  { naslov: "Aktualno", pot: "/aktualno" },
  { naslov: "Članstvo", pot: "/pridruzi-se" },
];
