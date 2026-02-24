import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/nav/navbar";
import Footer from "@/components/nav/footer";
import SmoothScrollProvider from "@/components/providers/smooth-scroll";

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
    <html lang="en">
      <body className="bg-[#0b1220] antialiased">
        <SmoothScrollProvider>
          <Navbar />
          <main id="top">{children}</main>
          <Footer />
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
