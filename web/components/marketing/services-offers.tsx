import Image from "next/image";
import BookServiceForm from "@/components/booking/book-service-form";

type ServiceCard = {
  defaultDate: string;
  details: readonly string[];
  image: string;
  perPersonPricing: boolean;
  positioning: string;
  serviceCode: string;
  timeSlots: readonly string[];
  price: string;
  title: string;
  unitPriceCents: number;
  upsell: string;
};

type BundleCard = {
  contents: string;
  price: string;
  title: string;
};

type ServicesOffersProps = {
  bundles: readonly BundleCard[];
  bundlesSubtitle: string;
  bundlesTitle: string;
  cards: readonly ServiceCard[];
  intro: string;
  subtitle: string;
  title: string;
};

export function ServicesOffers({
  bundles,
  bundlesSubtitle,
  bundlesTitle,
  cards,
  intro,
  subtitle,
  title,
}: ServicesOffersProps) {
  return (
    <section id="services" className="mx-auto w-full max-w-6xl px-4 pt-8 scroll-mt-24 md:pt-12">
      <div className="reveal reveal-header mb-10 border-l-4 border-[#3d2b1f] pl-4 text-left md:mb-12 md:pl-6">
        <h2 className="font-serif text-3xl font-bold tracking-tight text-white uppercase sm:text-4xl">{title}</h2>
        <p className="mt-2 text-base text-white/65 md:text-lg">{subtitle}</p>
        <p className="mt-3 max-w-4xl text-sm leading-relaxed text-white/50 md:text-base">{intro}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
        {cards.map((card, index) => (
          <article
            key={card.title}
            className="reveal reveal-card overflow-hidden rounded-2xl border border-white/10 bg-white/5"
            style={{ transitionDelay: `${index * 90}ms` }}
          >
            <div className="relative aspect-[16/7.2]">
              <Image
                src={card.image}
                alt={card.title}
                fill
                quality={74}
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0b1220] via-[#0b1220]/40 to-transparent" />
              <div className="absolute bottom-2 left-2 rounded-lg border border-white/10 bg-[#0b1220]/80 px-2 py-0.5 backdrop-blur-md">
                <p className="text-xs font-bold text-[#0ea5e9]">{card.price}</p>
              </div>
            </div>

            <div className="p-2.5 text-left md:p-3">
              <h3 className="text-[1.08rem] font-bold leading-tight text-white md:text-[1.28rem]">{card.title}</h3>
              <p className="mt-1 text-[13px] leading-relaxed text-white/65 md:text-sm">{card.positioning}</p>

              <ul className="mt-2 space-y-0.5 text-[12px] leading-relaxed text-white/50 md:text-[13px]">
                {card.details.map((detail) => (
                  <li key={detail} className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#a87f5d]" />
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>

              <p className="mt-2.5 rounded-lg border border-[#3d2b1f]/40 bg-[#3d2b1f]/15 px-2.5 py-1 text-[11px] font-semibold tracking-[0.04em] text-[#d9b48f] md:text-xs">
                {card.upsell}
              </p>

              <BookServiceForm
                defaultDate={card.defaultDate}
                perPersonPricing={card.perPersonPricing}
                serviceCode={card.serviceCode}
                timeSlots={card.timeSlots}
                serviceTitle={card.title}
                unitPriceCents={card.unitPriceCents}
              />
            </div>
          </article>
        ))}
      </div>

      <div className="reveal reveal-header mt-10 rounded-2xl border border-white/10 bg-white/5 p-4.5 md:mt-12 md:p-5">
        <h3 className="font-serif text-2xl font-bold uppercase text-white md:text-3xl">{bundlesTitle}</h3>
        <p className="mt-2 text-sm text-white/55 md:text-base">{bundlesSubtitle}</p>

        <div className="mt-4 grid grid-cols-1 gap-3.5 md:grid-cols-3">
          {bundles.map((bundle, index) => (
            <article
              key={bundle.title}
              className="reveal reveal-card rounded-xl border border-white/10 bg-[#0b1220]/45 p-3.5"
              style={{ transitionDelay: `${index * 90}ms` }}
            >
              <p className="text-xs font-black uppercase tracking-[0.14em] text-[#a87f5d]">{bundle.price}</p>
              <h4 className="mt-2 text-lg font-bold text-white">{bundle.title}</h4>
              <p className="mt-2 text-sm leading-relaxed text-white/55">{bundle.contents}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
