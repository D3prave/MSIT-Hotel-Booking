import { Instagram, Linkedin, Mail, MapPin } from "lucide-react";

type ContactUsProps = {
  email: string;
  journal: string;
  location: string;
  locationLine1: string;
  locationLine2: string;
  stay: string;
  titleHighlight: string;
  titlePrefix: string;
};

export function ContactUs({
  email,
  journal,
  location,
  locationLine1,
  locationLine2,
  stay,
  titleHighlight,
  titlePrefix,
}: ContactUsProps) {
  return (
    <section id="contact" className="bg-[#0b1220] px-4 py-20 sm:px-6 md:py-32">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 md:mb-20">
          <h2 className="font-serif text-4xl font-black italic leading-none tracking-tight text-white uppercase sm:text-5xl md:text-7xl">
            {titlePrefix} <br />
            <span className="text-[#a87f5d]">{titleHighlight}</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-3 lg:gap-12">
          <div className="group rounded-3xl border border-white/10 bg-white/[0.02] p-7 transition-colors hover:border-[#a87f5d]/50 md:rounded-[2.5rem] md:p-10">
            <Mail className="text-[#a87f5d] mb-6" size={32} strokeWidth={1.5} />
            <h3 className="text-white text-xs font-black uppercase tracking-[0.3em] mb-4">{stay}</h3>
            <a 
              href={`mailto:${email}`}
              className="break-all text-lg font-light text-white/70 transition-colors hover:text-white sm:break-normal sm:text-xl md:text-2xl"
            >
              {email}
            </a>
          </div>

          <div className="group rounded-3xl border border-white/10 bg-white/[0.02] p-7 transition-colors hover:border-[#a87f5d]/50 md:rounded-[2.5rem] md:p-10">
            <MapPin className="text-[#a87f5d] mb-6" size={32} strokeWidth={1.5} />
            <h3 className="text-white text-xs font-black uppercase tracking-[0.3em] mb-4">{location}</h3>
            <p className="text-lg font-light leading-snug text-white/70 sm:text-xl md:text-2xl">
              {locationLine1} <br />
              {locationLine2}
            </p>
          </div>

          <div className="group rounded-3xl border border-white/10 bg-white/[0.02] p-7 transition-colors hover:border-[#a87f5d]/50 md:rounded-[2.5rem] md:p-10">
            <div className="flex gap-4 mb-6">
              <Instagram className="text-[#a87f5d]" size={32} strokeWidth={1.5} />
              <Linkedin className="text-[#a87f5d]" size={32} strokeWidth={1.5} />
            </div>
            <h3 className="text-white text-xs font-black uppercase tracking-[0.3em] mb-4">{journal}</h3>
            <div className="flex flex-col gap-2">
              <a 
                href="https://www.instagram.com/denkraum1886/" 
                target="_blank" 
                className="text-lg font-light text-white/70 transition-colors hover:text-white sm:text-xl"
              >
                @denkraum1886
              </a>
              <a 
                href="https://www.linkedin.com/in/denkraum/" 
                target="_blank" 
                className="text-lg font-light text-white/70 transition-colors hover:text-white sm:text-xl"
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
