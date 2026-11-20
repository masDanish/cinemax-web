import type { Metadata, Viewport } from "next";
import { Bebas_Neue, Inter } from "next/font/google";
import { Providers } from "@/providers/Providers";
import { BRAND } from "@/lib/constants";
import { getSession } from "@/lib/session";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });
const bebas = Bebas_Neue({
  variable: "--font-bebas",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: `${BRAND.name} | ${BRAND.tagline}`, template: `%s | ${BRAND.name}` },
  description: "Pesan tiket bioskop, pilih kursi favorit, dan bayar dengan aman di CINEMAX.",
};

export const viewport: Viewport = {
  themeColor: "#080808",
  colorScheme: "dark",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  return (
    <html lang="id" className={`${inter.variable} ${bebas.variable}`}>
      <body>
        <Providers initialUser={session?.user ?? null}>{children}</Providers>
      </body>
    </html>
  );
}
