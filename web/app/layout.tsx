import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/nav/navbar";
import Footer from "@/components/nav/footer";

export const metadata: Metadata = {
  title: "DENKRAUM 1886",
  description: "Executive Retreat in Kipfenberg",
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
        <Footer />
      </body>
    </html>
  );
}