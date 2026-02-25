import Image from "next/image";

type HeroProps = {
  line1: string;
  line2: string;
  line3: string;
  subheadline: string;
};

export function Hero({ line1, line2, line3, subheadline }: HeroProps) {
  return (
    <section className="relative flex min-h-[100svh] w-full flex-col items-center justify-center overflow-hidden bg-[#0b1220]">
      <Image
        src="/lobby.jpeg"
        alt="DENKRAUM Lobby"
        fill
        priority
        sizes="100vw"
        className="hero-parallax-layer object-cover opacity-45"
      />
      
      <div className="absolute inset-0 bg-gradient-to-b from-[#0b1220] via-transparent to-[#0b1220] opacity-80" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(11,18,32,0.18)_0%,rgba(11,18,32,0.62)_72%)]" />

      <div className="relative z-10 px-4 pt-16 text-center sm:pt-20 md:pt-24">
        <h1 className="font-serif text-[clamp(2.7rem,14vw,4.8rem)] font-black italic uppercase leading-[0.98] tracking-tight drop-shadow-2xl md:text-7xl">
          <span className="text-white block">{line1}</span>
          <span className="text-white/45 block [text-shadow:0_10px_24px_rgba(0,0,0,0.7)]">{line2}</span>
          <span className="block text-[#cfa07a] [text-shadow:0_10px_24px_rgba(0,0,0,0.78)] [-webkit-text-stroke:0.6px_rgba(45,27,16,0.45)]">
            {line3}
          </span>
        </h1>
        
        <p className="mx-auto mt-7 max-w-[22rem] text-[10px] font-black uppercase tracking-[0.22em] text-white/50 leading-relaxed drop-shadow-md sm:max-w-2xl sm:tracking-[0.3em] md:mt-8 md:text-xs md:tracking-[0.4em]">
          {subheadline}
        </p>
        
        <div className="mx-auto mt-8 h-[1px] w-20 bg-[#a87f5d]/30 md:mt-10 md:w-24" />
      </div>
    </section>
  );
}
