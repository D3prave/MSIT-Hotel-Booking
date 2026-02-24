export function Hero() {
  return (
    <section className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden bg-[#0b1220]">
      {/* Tło - Twoje zdjęcie lobby */}
      <img 
        src="/lobby.jpeg" 
        alt="DENKRAUM Lobby" 
        className="absolute inset-0 h-full w-full object-cover opacity-50"
      />
      
      {/* Ciemny gradient dla kontrastu */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0b1220] via-transparent to-[#0b1220] opacity-80" />

      <div className="relative z-10 text-center px-4 pt-24">
        {/* Nagłówek w trzech kolorach zgodnie z prośbą */}
        <h1 className="font-serif text-5xl md:text-7xl font-black italic tracking-tighter uppercase leading-[1.1] drop-shadow-2xl">
          <span className="text-white block">Work clearly.</span>
          <span className="text-white/40 block">Rest deeply.</span>
          <span className="text-[#a87f5d] block">Drive freely.</span>
        </h1>
        
        {/* Subheadline wpisany bezpośrednio */}
        <p className="mx-auto mt-8 max-w-2xl text-[10px] md:text-xs font-black uppercase tracking-[0.4em] text-white/50 leading-relaxed drop-shadow-md">
          Your professional agenda transforms into meaningful personal time in our historic farmhouse.
        </p>
        
        {/* Dekoracyjna linia w kolorze brązu */}
        <div className="mx-auto mt-10 h-[1px] w-24 bg-[#a87f5d]/30" />
      </div>
    </section>
  );
}