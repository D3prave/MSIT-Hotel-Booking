export function AboutUs() {
  return (
    <section id="about" className="border-b border-white/5 bg-[#0b1220] px-4 py-20 sm:px-6 md:py-32">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-2 lg:gap-20">
          
          <div className="space-y-8 md:space-y-10">
            <h2 className="font-serif text-4xl font-black italic leading-none tracking-tight text-white uppercase sm:text-5xl md:text-6xl">
              A Legacy of <br />
              <span className="text-[#a87f5d]">Innovation</span>
            </h2>
            <div className="space-y-5 text-base font-light leading-relaxed text-white/55 md:space-y-6 md:text-lg">
              <p>
                The year 1886 was a pivot point for humanity. While the original stone 
                walls of our farmhouse were being raised in the Bavarian countryside, 
                Carl Benz was patenting the Motorwagen. These two worlds, steadfast 
                tradition and radical movement, are the DNA of DENKRAUM.
              </p>
              <p>
                Originally built as a regional hub for agriculture and community gathering, 
                the estate has survived over a century of change. In 2026, it was 
                meticulously restored to serve the modern pioneer.
              </p>
              <p className="text-[#a87f5d] font-medium italic">
                Today, DENKRAUM 1886 stands as a bridge between Ingolstadt’s automotive 
                future and Bavaria’s cultural heritage.
              </p>
            </div>
          </div>

          <div className="relative rounded-3xl border border-white/10 bg-white/[0.03] p-8 shadow-2xl backdrop-blur-xl sm:p-10 md:rounded-[3.5rem] md:p-16">
            <div className="space-y-10 md:space-y-16">
              <div className="group">
                <h3 className="font-serif text-2xl font-black italic leading-none tracking-tight text-white uppercase transition-colors group-hover:text-[#a87f5d] sm:text-3xl md:text-5xl">
                  Productivity
                </h3>
                <p className="mt-4 text-[11px] uppercase tracking-[0.2em] text-white/35 leading-relaxed md:text-[14px] md:tracking-[0.3em]">
                  Focused workspaces designed for deep work and executive clarity.
                </p>
              </div>

              <div className="group">
                <h3 className="font-serif text-2xl font-black italic leading-none tracking-tight text-white uppercase transition-colors group-hover:text-[#a87f5d] sm:text-3xl md:text-5xl">
                  Regeneration
                </h3>
                <p className="mt-4 text-[11px] uppercase tracking-[0.2em] text-white/35 leading-relaxed md:text-[14px] md:tracking-[0.3em]">
                  Boutique wellness and Finnish sauna traditions for total recovery.
                </p>
              </div>

              <div className="group">
                <h3 className="font-serif text-2xl font-black italic leading-none tracking-tight text-white uppercase transition-colors group-hover:text-[#a87f5d] sm:text-3xl md:text-5xl">
                  Experience
                </h3>
                <p className="mt-4 text-[11px] uppercase tracking-[0.2em] text-white/35 leading-relaxed md:text-[14px] md:tracking-[0.3em]">
                  Scenic driving routes and classic-car culture at the gateway to nature.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
