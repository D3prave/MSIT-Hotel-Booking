import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/nav/navbar";
import Footer from "@/components/nav/footer";
import SmoothScrollProvider from "@/components/providers/smooth-scroll";
import LanguageProvider from "@/components/providers/language-provider";
import ToastProvider from "@/components/providers/toast-provider";
import { getServerLocale } from "@/lib/i18n/server";

export const metadata: Metadata = {
  title: "DENKRAUM 1886",
  description: "Executive Retreat in Kipfenberg",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getServerLocale();

  return (
    <html lang={locale}>
      <body className="bg-[#0b1220] antialiased">
        <LanguageProvider initialLocale={locale}>
          <ToastProvider>
            <SmoothScrollProvider>
              <Navbar />
              <main id="top">{children}</main>
              <Footer />
            </SmoothScrollProvider>
          </ToastProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
