import type { NextConfig } from "next";

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
    ];
  },
};

export default nextConfig;
