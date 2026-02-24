// web/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
// Usuwamy klamry {}, ponieważ Navbar jest eksportem domyślnym
import Navbar from "@/components/nav/navbar"; 
import { siteConfig } from "@/config/site-config";

export const metadata: Metadata = {
  title: siteConfig.name,
  description: siteConfig.description,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-[#0b1220] antialiased">
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}