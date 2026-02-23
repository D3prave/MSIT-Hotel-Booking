import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/nav/navbar";
import { siteConfig } from "@/config/site-config";

export const metadata: Metadata = {
  title: siteConfig.name,
  description: siteConfig.description,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-dvh bg-[#0b1220] text-white">
        <Navbar />
        <main>{children}</main>

        <footer className="border-t border-white/10 py-8">
          <div className="mx-auto max-w-6xl px-4 text-sm text-white/70">
            Academic Project: This is a fictional website created for MSIT
            coursework.
          </div>
        </footer>
      </body>
    </html>
  );
}