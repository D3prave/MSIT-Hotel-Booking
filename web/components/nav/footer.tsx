import { Instagram, Linkedin } from "lucide-react";

export default function Footer() {
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
          <img src="/logo.png" alt="Logo" className="h-4 w-auto grayscale" />
          <span className="font-serif text-sm font-bold italic tracking-tighter text-white uppercase">
            DENKRAUM 1886
          </span>
        </div>
        
        {/* Disclosure - Informacja o symulacji */}
        <div className="flex flex-col items-center gap-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20 text-center max-w-lg leading-loose">
            This website is a part of a simulation for educational purposes. 
            All bookings, services, and corporate retreat offerings are not real. 
            Built as a professional prototype for the Kipfenberg estate development.
          </p>
        </div>
        
        <div className="text-[9px] text-white/10 uppercase tracking-[0.4em] font-black mt-4">
          © {new Date().getFullYear()} KIPFENBERG ESTATE • GERMANY
        </div>
      </div>
    </footer>
  );
}