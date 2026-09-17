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
};

export default nextConfig;
