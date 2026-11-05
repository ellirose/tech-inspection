// Addresses that match no route at all (old Wix pages, typos): the same 404 page as inside the site,
// with its own document, since the site's layout sits under [lang]. Search engines are told not to index it.
import type { Metadata, Viewport } from "next";
import { Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { NotFoundView } from "@/components/layout/NotFoundView";
import { SITE_URL } from "@/lib/site";

const sans = Plus_Jakarta_Sans({ subsets: ["latin", "latin-ext"], variable: "--font-jakarta", display: "swap" });
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "404 · Tech-Inspection",
  description: "Página no encontrada · Página não encontrada · Page not found",
  robots: { index: false },
};

export const viewport: Viewport = { themeColor: "#030a12", colorScheme: "dark" };

export default function GlobalNotFound() {
  return (
    <html lang="es-CO" data-theme="dark" className={`${sans.variable} ${mono.variable}`}>
      <body className="min-h-svh overflow-x-clip">
        <main>
          <NotFoundView />
        </main>
      </body>
    </html>
  );
}
