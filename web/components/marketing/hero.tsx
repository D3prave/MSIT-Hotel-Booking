// web/components/marketing/hero.tsx
export function Hero() {
  return (
    <section className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden bg-[#0b1220]">
      {/* Zdjęcie tła z przyciemnieniem */}
      <img 
        src="/lobby.jpeg" 
        alt="DENKRAUM Lobby" 
        className="absolute inset-0 h-full w-full object-cover opacity-50"
      />
      
      {/* Mocniejszy gradient dla lepszej czytelności tekstu */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0b1220] via-transparent to-[#0b1220] opacity-80" />

      <div className="relative z-10 text-center px-4 pt-24">
        <h1 className="font-serif text-6xl md:text-8xl font-black italic tracking-tighter text-white uppercase leading-[0.85] drop-shadow-2xl">
          Deep Focus <br /> 
          <span className="text-[#a87f5d] drop-shadow-[0_5px_15px_rgba(0,0,0,0.5)]">
            Rural Peace
          </span>
        </h1>
        <p className="mt-8 text-[10px] md:text-xs font-black uppercase tracking-[0.5em] text-white/60 drop-shadow-md">
          Exclusive Retreat in Kipfenberg
        </p>
        
        {/* Subtelna linia dekoracyjna */}
        <div className="mx-auto mt-8 h-[1px] w-24 bg-[#a87f5d]/50" />
      </div>
    </section>
  );
}