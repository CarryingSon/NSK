import type { Metadata } from "next";
import { JetBrains_Mono, Manrope } from "next/font/google";

import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Poziralnik",
  description: "Interni administracijski sistem za vodenje članstva in dogodkov.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="sl"
      className={`${manrope.variable} ${jetBrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body>
        {/* Shranjeno izbiro nanesemo pred izrisom, sicer ob vsakem nalaganju
            utripne napačna shema. Ročnega <head> tu ne sme biti - Next v tem
            primeru neha vstavljati metapodatke, med njimi ikone. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem("theme");if(t==="dark"||t==="light")document.documentElement.classList.add(t)}catch(e){}`,
          }}
        />
        {children}
      </body>
    </html>
  );
}
