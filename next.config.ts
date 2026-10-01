import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Slike starih novic še vedno stojijo na Cloudinaryju prejšnjega izvajalca.
    // Ko se preselijo v Supabase Storage, ta vnos odpade.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/vrenko007/**",
      },
    ],
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
