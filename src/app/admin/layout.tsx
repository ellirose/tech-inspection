import type { Metadata } from "next";
import { Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "../globals.css";
import { hasDatabase } from "@/db";

// Separate root layout: the admin panel is Spanish-only and has none of the public site's chrome.
const sans = Plus_Jakarta_Sans({ subsets: ["latin", "latin-ext"], variable: "--font-jakarta", display: "swap" });
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Panel", template: "%s · Panel Tech-Inspection" },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    // Dark only, like the public site (shared tokens in globals.css).
    <html lang="es-CO" data-theme="dark" className={`${sans.variable} ${mono.variable}`}>
      <body className="min-h-svh bg-canvas text-ink antialiased">
        {hasDatabase ? (
          children
        ) : (
          // Frontend-only deployment: accounts, leads and content live in the database
          <main className="grid min-h-svh place-items-center p-6 text-center">
            <div className="max-w-md">
              <h1 className="text-2xl font-extrabold">Panel no disponible</h1>
              <p className="mt-3 text-ink-soft">Este despliegue solo muestra el sitio público: no tiene base de datos configurada.</p>
            </div>
          </main>
        )}
      </body>
    </html>
  );
}
