import { Instagram, Linkedin, Mail, MapPin } from "lucide-react";

export function ContactUs() {
  return (
    <section id="contact" className="bg-[#0b1220] py-32 px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-20">
          <h2 className="font-serif text-5xl md:text-7xl font-black italic tracking-tighter text-white uppercase leading-none">
            Get in <br />
            <span className="text-[#a87f5d]">Touch</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {/* Stay / Email Contact */}
          <div className="group border border-white/10 bg-white/[0.02] p-10 rounded-[2.5rem] hover:border-[#a87f5d]/50 transition-colors">
            <Mail className="text-[#a87f5d] mb-6" size={32} strokeWidth={1.5} />
            <h3 className="text-white text-xs font-black uppercase tracking-[0.3em] mb-4">Stay</h3>
            <a 
              href="mailto:stay@denkraum1886.com" 
              className="text-xl md:text-2xl text-white/70 font-light hover:text-white transition-colors"
            >
              stay@denkraum1886.com
            </a>
          </div>

          {/* Location Information */}
          <div className="group border border-white/10 bg-white/[0.02] p-10 rounded-[2.5rem] hover:border-[#a87f5d]/50 transition-colors">
            <MapPin className="text-[#a87f5d] mb-6" size={32} strokeWidth={1.5} />
            <h3 className="text-white text-xs font-black uppercase tracking-[0.3em] mb-4">Location</h3>
            <p className="text-xl md:text-2xl text-white/70 font-light leading-snug">
              Kipfenberg Estate <br />
              Altmühltal, Germany
            </p>
          </div>

          {/* Social Media Integration */}
          <div className="group border border-white/10 bg-white/[0.02] p-10 rounded-[2.5rem] hover:border-[#a87f5d]/50 transition-colors">
            <div className="flex gap-4 mb-6">
              <Instagram className="text-[#a87f5d]" size={32} strokeWidth={1.5} />
              <Linkedin className="text-[#a87f5d]" size={32} strokeWidth={1.5} />
            </div>
            <h3 className="text-white text-xs font-black uppercase tracking-[0.3em] mb-4">Journal</h3>
            <div className="flex flex-col gap-2">
              <a 
                href="https://www.instagram.com/denkraum1886/" 
                target="_blank" 
                className="text-xl text-white/70 font-light hover:text-white transition-colors"
              >
                @denkraum1886
              </a>
              <a 
                href="https://www.linkedin.com/in/denkraum/" 
                target="_blank" 
                className="text-xl text-white/70 font-light hover:text-white transition-colors"
              >
                /in/denkraum
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}