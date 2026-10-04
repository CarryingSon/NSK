import type { NextConfig } from "next";

const oldDocumentRedirects = [
  ["dc2ca2ef0a7595dd5d1aaff1ae506dce.pdf", "/dokumenti/statut-kluba.pdf"],
  ["ef987c09f48467bd2f1f87afca54814e.pdf", "/dokumenti/volilni-pravilnik-organi-nsk.pdf"],
  ["918df7775a26d2312aa34fc80bcd7c5f.pdf", "/dokumenti/pravilnik-o-nabavi.pdf"],
  ["a77cc92cddb07e474bfad2df879a5127.pdf", "/dokumenti/pravilnik-o-honorarjih.pdf"],
  ["e35e2051db3051716537edbb53d3df94.pdf", "/dokumenti/katalog-informacij-javnega-znacaja.pdf"],
  ["9346a45cfa559d7e5b718f39c41923a8.pdf", "/dokumenti/pravilnik-status-organizacijske-oblike.pdf"],
  ["ca256b0fedd7d8a384172b37211fd6c4.pdf", "/dokumenti/pravilnik-ustanavljanje-organizacijskih-oblik.pdf"],
  ["a1150835971ab3c5165487b1522bfe8a.pdf", "/dokumenti/volilni-pravilnik-svetniki-sols.pdf"],
  ["82a6b14f4c2298ae958256891c804f07.pdf", "/dokumenti/studentska-ustava.pdf"],
  ["af47310845ada98d00eca89eb9207020.pdf", "/dokumenti/pravilnik-o-financnem-nacrtu.pdf"],
  ["d30b1a5a016919b8934b58837286efcc.pdf", "/dokumenti/pravilnik-o-varovanju-osebnih-podatkov.pdf"],
  ["f8b9e630becd9a42eb20451132e3a86c.pdf", "/dokumenti/kriteriji-kakovosti-2023.pdf"],
  ["e7106aee8b9316109e68c43fe43bb9b1.pdf", "/dokumenti/politika-zasebnosti.pdf"],
  ["ea27f83eaef6fdd4e77f9935c17f9e5d.docx", "/dokumenti/redni-obcni-zbor-2025.docx"],
  ["1849dced448426f86693081e2f461e61.pdf", "/dokumenti/pristopna-izjava.pdf"],
  ["a7d253c9c2fc173aef5045aa99a84feb.pdf", "/heksnsus/heksnsus-zima-2019.pdf"],
  ["7649fa4872e4e9221f00045e9f75aa5b.pdf", "/heksnsus/heksnsus-zima-2020.pdf"],
  ["2b08d2fbcd36febe6776a9f5e5562baa.pdf", "/heksnsus/heksnsus-zima-2021.pdf"],
].map(([source, destination]) => ({
  source: `/${source}`,
  destination,
  permanent: true,
}));

const nextConfig: NextConfig = {
  // Predlogo pristopne izjave in pisavo bere strežnik z diska. Sledenje datotek
  // poti, sestavljene iz process.cwd(), ne zazna, zato ju dodamo ročno.
  outputFileTracingIncludes: {
    "/*": ["./lib/pristopna-izjava/*.{pdf,ttf}"],
  },
  images: {
    // Slike člankov stojijo v javnem vedru "clanki" v Supabase Storage.
    remotePatterns: process.env.NEXT_PUBLIC_SUPABASE_URL
      ? [
          {
            protocol: "https",
            hostname: new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname,
            pathname: "/storage/v1/object/public/clanki/**",
          },
        ]
      : [],
  },
  async headers() {
    // Predogled za stranko stoji na svojem naslovu. Brez tega bi ga iskalniki
    // lahko zajeli in bi po preklopu tekmoval z nsk-klub.si za isto vsebino.
    // Produkcije se ne dotakne - tam mora stran ostati najdljiva.
    if (process.env.VERCEL_ENV === "production") {
      return [];
    }

    return [
      {
        source: "/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
  async redirects() {
    return [
      // "O NŠK" je v meniju le spust in ne stran zase, zato /o-nas nima vsebine.
      // Kdor naslov vtipka ali ga najde v iskalniku, naj pride do prve podstrani
      // namesto do 404. Preusmeritev je začasna (307), ker se lahko sem kdaj
      // postavi pregledna stran o klubu.
      { source: "/o-nas", destination: "/o-nas/vodstvo", permanent: false },
      // Stara stran je dokumente stregla pod zgoščenimi imeni v korenu domene
      // in nanje kažejo povezave od drugod. Vsak naslov vodi na isto datoteko
      // na novi strani (preverjeno po vsebini; stara pristopna izjava iz 2024
      // vodi na zdajšnjo).
      ...oldDocumentRedirects,
    ];
  },
};

export default nextConfig;
