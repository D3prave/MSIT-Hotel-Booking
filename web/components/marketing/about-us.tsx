export function AboutUs() {
  return (
    <section id="about" className="bg-[#0b1220] py-32 px-6 border-b border-white/5">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
          
          {/* History & Story */}
          <div className="space-y-10">
            <h2 className="font-serif text-5xl md:text-6xl font-black italic tracking-tighter text-white uppercase leading-none">
              A Legacy of <br />
              <span className="text-[#a87f5d]">Innovation</span>
            </h2>
            <div className="space-y-6 text-lg leading-relaxed text-white/50 font-light">
              <p>
                The year 1886 was a pivot point for humanity. While the original stone 
                walls of our farmhouse were being raised in the Bavarian countryside, 
                Carl Benz was patenting the Motorwagen. These two worlds—steadfast 
                tradition and radical movement—are the DNA of DENKRAUM.
              </p>
              <p>
                Originally built as a regional hub for agriculture and community gathering, 
                the estate has survived over a century of change. In 2024, it was 
                meticulously restored to serve the modern pioneer.
              </p>
              <p className="text-[#a87f5d] font-medium italic">
                Today, DENKRAUM 1886 stands as a bridge between Ingolstadt’s automotive 
                future and Bavaria’s cultural heritage.
              </p>
            </div>
          </div>

          {/* Core Pillars - Re-scaled Titles */}
          <div className="relative border border-white/10 bg-white/[0.03] p-12 md:p-16 rounded-[3.5rem] backdrop-blur-xl shadow-2xl">
            <div className="space-y-16">
              <div className="group">
                <h3 className="font-serif text-3xl md:text-5xl font-black italic tracking-tighter text-white uppercase leading-none transition-colors group-hover:text-[#a87f5d]">
                  Productivity
                </h3>
                <p className="mt-4 text-[14px] text-white/30 leading-relaxed uppercase tracking-[0.3em]">
                  Focused workspaces designed for deep work and executive clarity.
                </p>
              </div>

              <div className="group">
                <h3 className="font-serif text-3xl md:text-5xl font-black italic tracking-tighter text-white uppercase leading-none transition-colors group-hover:text-[#a87f5d]">
                  Regeneration
                </h3>
                <p className="mt-4 text-[14px] text-white/30 leading-relaxed uppercase tracking-[0.3em]">
                  Boutique wellness and Finnish sauna traditions for total recovery.
                </p>
              </div>

              <div className="group">
                <h3 className="font-serif text-3xl md:text-5xl font-black italic tracking-tighter text-white uppercase leading-none transition-colors group-hover:text-[#a87f5d]">
                  Experience
                </h3>
                <p className="mt-4 text-[14px] text-white/30 leading-relaxed uppercase tracking-[0.3em]">
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