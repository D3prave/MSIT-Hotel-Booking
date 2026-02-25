type AboutPillar = {
  description: string;
  title: string;
};

type AboutUsProps = {
  paragraphs: readonly string[];
  pillars: readonly AboutPillar[];
  titleHighlight: string;
  titlePrefix: string;
};

export function AboutUs({
  paragraphs,
  pillars,
  titleHighlight,
  titlePrefix,
}: AboutUsProps) {
  return (
    <section id="about" className="border-b border-white/5 bg-[#0b1220] px-4 py-20 sm:px-6 md:py-32">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 items-start gap-10 md:gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="space-y-8 md:space-y-10">
            <h2 className="font-serif text-4xl font-black italic leading-none tracking-tight text-white uppercase sm:text-5xl md:text-6xl">
              {titlePrefix} <br />
              <span className="text-[#a87f5d]">{titleHighlight}</span>
            </h2>
            <div className="space-y-5 text-base font-light leading-relaxed text-white/55 md:space-y-6 md:text-lg">
              {paragraphs[0] && <p>{paragraphs[0]}</p>}
              {paragraphs[1] && <p>{paragraphs[1]}</p>}
              {paragraphs[2] && <p className="text-[#a87f5d] font-medium italic">{paragraphs[2]}</p>}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-lg rounded-[2rem] border border-white/10 bg-white/[0.03] p-5 shadow-2xl backdrop-blur-xl sm:p-7 md:rounded-[2.3rem] md:p-9 lg:mx-0 lg:ml-auto lg:p-10">
            <div className="divide-y divide-white/10">
              {pillars.map((pillar) => (
                <div key={pillar.title} className="group py-5 first:pt-0 last:pb-0 sm:py-6">
                  <h3 className="font-serif text-[clamp(1.35rem,7.2vw,2.8rem)] font-black italic leading-[0.95] tracking-tight text-white uppercase whitespace-nowrap hyphens-none transition-colors group-hover:text-[#a87f5d]">
                    {pillar.title}
                  </h3>
                  <p className="mt-2.5 max-w-[36ch] text-[11px] uppercase leading-relaxed tracking-[0.08em] text-white/45 sm:text-xs md:mt-3 md:text-[13px] md:tracking-[0.1em]">
                    {pillar.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
