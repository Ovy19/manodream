import type { Metadata } from "next";
import { Bebas_Neue, Rajdhani, Cinzel, Bangers, Nunito } from "next/font/google";
import "./globals.css";

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
});

const rajdhani = Rajdhani({
  weight: ["300", "400", "600", "700"],
  subsets: ["latin"],
  variable: "--font-rajdhani",
});

const cinzel = Cinzel({
  weight: ["400", "700", "900"],
  subsets: ["latin"],
  variable: "--font-cinzel",
});

const bangers = Bangers({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bangers",
});

const nunito = Nunito({
  weight: ["700", "800", "900"],
  subsets: ["latin"],
  variable: "--font-nunito",
});

export const metadata: Metadata = {
  title: "MANODREAM",
  description: "Webtoon original — Action · Fantastique · Aventure",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={`${bebasNeue.variable} ${rajdhani.variable} ${cinzel.variable} ${bangers.variable} ${nunito.variable}`}>
      <body>{children}</body>
    </html>
  );
}
