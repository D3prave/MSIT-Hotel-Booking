import { Instagram, Linkedin } from "lucide-react";
import Image from "next/image";
import { getServerLocale } from "@/lib/i18n/server";
import { translations } from "@/lib/i18n/translations";

export default async function Footer() {
  const locale = await getServerLocale();
  const t = translations[locale].footer;

  return (
    <footer className="w-full border-t border-white/5 bg-[#0b1220] py-16 px-6">
      <div className="mx-auto max-w-7xl flex flex-col items-center gap-8">
        
        {/* Social Media Links */}
        <div className="flex items-center gap-6">
          <a 
            href="https://www.instagram.com/denkraum1886/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-white/20 hover:text-white transition-colors"
          >
            <Instagram size={18} strokeWidth={1.5} />
          </a>
          <a 
            href="https://www.linkedin.com/in/denkraum/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-white/20 hover:text-white transition-colors"
          >
            <Linkedin size={18} strokeWidth={1.5} />
          </a>
        </div>

        {/* Logo w wersji przygaszonej */}
        <div className="flex items-center gap-3 opacity-20">
          <Image src="/logo.png" alt="Logo" width={56} height={24} className="h-4 w-auto grayscale" />
          <span className="font-serif text-sm font-bold italic tracking-tighter text-white uppercase">
            DENKRAUM 1886
          </span>
        </div>
        
        <div className="flex flex-col items-center gap-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20 text-center max-w-lg leading-loose">
            {t.disclosure}
          </p>
        </div>
        
        <div className="text-[9px] text-white/10 uppercase tracking-[0.4em] font-black mt-4">
          © {new Date().getFullYear()} {t.estate} • {t.country}
        </div>
      </div>
    </footer>
  );
}
