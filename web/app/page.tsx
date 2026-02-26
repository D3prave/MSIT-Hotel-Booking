// web/app/page.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { CalendarDays } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { Hero } from "@/components/marketing/hero";
import { AboutUs } from "@/components/marketing/about-us";
import { ContactUs } from "@/components/marketing/contact-us";
import { ServicesOffers } from "@/components/marketing/services-offers";
import { GuestFeedback } from "@/components/marketing/guest-feedback";
import BookRoomForm from "@/components/booking/book-room-form";
import { useLanguage } from "@/components/providers/language-provider";
import { getRoomCategory, type RoomCategory } from "@/lib/i18n/translations";
import { SERVICE_TIME_SLOTS } from "@/lib/booking/service-time-slots";

type Room = {
  description: string | null;
  description_i18n?: Record<string, string> | null;
  id: string;
  is_available: boolean;
  price_cents: number;
  type: string;
};

type AvailabilityRpcRow = {
  available_rooms: number;
  category: string;
  day: string;
  total_rooms: number;
};

type CategoryAvailabilityCell = {
  available: number;
  day: string;
  total: number;
};

const SECTION_IDS = ["about", "experience", "rooms", "services", "feedback", "contact"] as const;
type SectionId = (typeof SECTION_IDS)[number];
const CATEGORY_ORDER: RoomCategory[] = ["economy", "superior", "deluxe", "attic"];

const CATEGORY_IMAGE: Record<RoomCategory, string> = {
  attic: "/suite.jpeg",
  deluxe: "/deluxe.jpeg",
  economy: "/economy.jpeg",
  superior: "/superior.jpeg",
};

const CATEGORY_DEFAULT_PRICE_CENTS: Record<RoomCategory, number> = {
  attic: 25000,
  deluxe: 22000,
  economy: 18000,
  superior: 19500,
};

const SERVICE_BOOKING_CONFIG = [
  {
    perPersonPricing: true,
    serviceCode: "stretch_think_workshop",
    timeSlots: SERVICE_TIME_SLOTS,
    unitPriceCents: 2900,
  },
  {
    perPersonPricing: true,
    serviceCode: "infused_drink_tasting",
    timeSlots: SERVICE_TIME_SLOTS,
    unitPriceCents: 1800,
  },
  {
    perPersonPricing: false,
    serviceCode: "conference_room_rental",
    timeSlots: SERVICE_TIME_SLOTS,
    unitPriceCents: 8900,
  },
  {
    perPersonPricing: false,
    serviceCode: "wellness_addons",
    timeSlots: SERVICE_TIME_SLOTS,
    unitPriceCents: 5900,
  },
  {
    perPersonPricing: false,
    serviceCode: "scenic_drive_picnic",
    timeSlots: SERVICE_TIME_SLOTS,
    unitPriceCents: 8900,
  },
  {
    perPersonPricing: true,
    serviceCode: "local_culinary_experience",
    timeSlots: SERVICE_TIME_SLOTS,
    unitPriceCents: 5900,
  },
] as const;

const AVAILABILITY_DAYS = 7;

function isRoomCategoryValue(value: string): value is RoomCategory {
  return (CATEGORY_ORDER as readonly string[]).includes(value);
}

function getLocalDateInputValue(date: Date) {
  const local = new Date(date);
  local.setMinutes(local.getMinutes() - local.getTimezoneOffset());
  return local.toISOString().slice(0, 10);
}

function getTodayLocalDateInputValue() {
  return getLocalDateInputValue(new Date());
}

function getNextDay(dateStr: string) {
  const d = new Date(`${dateStr}T00:00:00`);
  d.setDate(d.getDate() + 1);
  return getLocalDateInputValue(d);
}

function getDateWindow(startDate: string, days: number) {
  const dateStrings: string[] = [];
  let cursor = startDate;
  for (let i = 0; i < days; i += 1) {
    dateStrings.push(cursor);
    cursor = getNextDay(cursor);
  }
  return dateStrings;
}

export default function HomePage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const { locale, t } = useLanguage();

  const [rooms, setRooms] = useState<Room[]>([]);
  const today = getTodayLocalDateInputValue();
  const [startDate, setStartDate] = useState(getTodayLocalDateInputValue);
  const [endDate, setEndDate] = useState(() => getNextDay(getTodayLocalDateInputValue()));
  const [activeSection, setActiveSection] = useState<SectionId>("about");
  const [categoryAvailability, setCategoryAvailability] = useState<
    Record<RoomCategory, CategoryAvailabilityCell[]>
  >({
    attic: [],
    deluxe: [],
    economy: [],
    superior: [],
  });
  const startInputRef = useRef<HTMLInputElement>(null);
  const endInputRef = useRef<HTMLInputElement>(null);
  const availabilityDayFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale === "de" ? "de-DE" : "en-US", {
        day: "2-digit",
        month: "2-digit",
      }),
    [locale]
  );

  useEffect(() => {
    const fetchRooms = async () => {
      const { data } = await supabase.from("rooms").select("*").eq("is_available", true);
      if (data) setRooms(data as Room[]);
    };
    fetchRooms();
  }, [supabase]);

  useEffect(() => {
    let isMounted = true;

    const dateWindow = getDateWindow(today, AVAILABILITY_DAYS);
    const roomTotalsByCategory = CATEGORY_ORDER.reduce(
      (acc, category) => {
        acc[category] = rooms.filter((room) => getRoomCategory(room.type) === category).length;
        return acc;
      },
      {
        attic: 0,
        deluxe: 0,
        economy: 0,
        superior: 0,
      } as Record<RoomCategory, number>
    );

    const fallbackState = CATEGORY_ORDER.reduce(
      (acc, category) => {
        const total = roomTotalsByCategory[category];
        acc[category] = dateWindow.map((day) => ({ available: total, day, total }));
        return acc;
      },
      {
        attic: [] as CategoryAvailabilityCell[],
        deluxe: [] as CategoryAvailabilityCell[],
        economy: [] as CategoryAvailabilityCell[],
        superior: [] as CategoryAvailabilityCell[],
      }
    );

    const fetchCategoryAvailability = async () => {
      const { data, error } = await supabase.rpc("get_room_category_availability", {
        days_param: AVAILABILITY_DAYS,
        start_date_param: today,
      });

      if (!isMounted) return;

      if (error || !Array.isArray(data)) {
        setCategoryAvailability(fallbackState);
        return;
      }

      const rows = data as AvailabilityRpcRow[];
      const nextState = CATEGORY_ORDER.reduce(
        (acc, category) => {
          const rowByDay = new Map(
            rows
              .filter((row) => isRoomCategoryValue(String(row.category)) && row.category === category)
              .map((row) => [
                String(row.day),
                {
                  available: Number(row.available_rooms ?? 0),
                  day: String(row.day),
                  total: Number(row.total_rooms ?? 0),
                } satisfies CategoryAvailabilityCell,
              ])
          );

          acc[category] = dateWindow.map((day) => {
            const fromRow = rowByDay.get(day);
            if (fromRow) return fromRow;
            const total = roomTotalsByCategory[category];
            return { available: total, day, total };
          });
          return acc;
        },
        {
          attic: [] as CategoryAvailabilityCell[],
          deluxe: [] as CategoryAvailabilityCell[],
          economy: [] as CategoryAvailabilityCell[],
          superior: [] as CategoryAvailabilityCell[],
        }
      );

      setCategoryAvailability(nextState);
    };

    void fetchCategoryAvailability();

    return () => {
      isMounted = false;
    };
  }, [rooms, supabase, today]);

  useEffect(() => {
    let rafId = 0;

    const updateParallax = () => {
      const y = Math.min(window.scrollY * 0.18, 120);
      document.documentElement.style.setProperty("--hero-parallax-y", `${y}px`);
      rafId = 0;
    };

    const onScroll = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(updateParallax);
    };

    updateParallax();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("lenis-scroll", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("lenis-scroll", onScroll);
      if (rafId) window.cancelAnimationFrame(rafId);
      document.documentElement.style.setProperty("--hero-parallax-y", "0px");
    };
  }, []);

  useEffect(() => {
    const sections = SECTION_IDS.map((id) => document.getElementById(id)).filter(
      (element): element is HTMLElement => Boolean(element)
    );
    if (sections.length === 0) return;

    const sectionRatios = new Map<SectionId, number>();
    SECTION_IDS.forEach((id) => sectionRatios.set(id, 0));

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.id as SectionId;
          sectionRatios.set(id, entry.isIntersecting ? entry.intersectionRatio : 0);
        }

        let bestId: SectionId = SECTION_IDS[0];
        let bestRatio = -1;
        for (const id of SECTION_IDS) {
          const ratio = sectionRatios.get(id) ?? 0;
          if (ratio > bestRatio) {
            bestRatio = ratio;
            bestId = id;
          }
        }

        if (bestRatio <= 0) {
          const fallback = sections
            .map((element) => ({
              id: element.id as SectionId,
              offset: Math.abs(element.getBoundingClientRect().top - window.innerHeight * 0.32),
            }))
            .sort((a, b) => a.offset - b.offset)[0];
          if (fallback) bestId = fallback.id;
        }

        setActiveSection(bestId);
      },
      {
        rootMargin: "-30% 0px -45% 0px",
        threshold: [0, 0.15, 0.35, 0.6, 0.9],
      }
    );

    for (const section of sections) {
      observer.observe(section);
    }

    return () => {
      observer.disconnect();
    };
  }, [locale]);

  useEffect(() => {
    const revealElements = Array.from(
      document.querySelectorAll<HTMLElement>(".reveal")
    );
    if (revealElements.length === 0) return;

    let rafId = 0;

    const applyRevealState = () => {
      const vh = window.innerHeight;
      const enterTop = vh * 0.9;
      const minVisibleBottom = vh * 0.04;

      for (const element of revealElements) {
        const rect = element.getBoundingClientRect();
        const shouldShow = rect.top < enterTop && rect.bottom > minVisibleBottom;
        element.classList.toggle("is-visible", shouldShow);
      }
      rafId = 0;
    };

    const requestRevealUpdate = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(applyRevealState);
    };

    requestRevealUpdate();
    window.addEventListener("scroll", requestRevealUpdate, { passive: true });
    window.addEventListener("lenis-scroll", requestRevealUpdate);
    window.addEventListener("touchmove", requestRevealUpdate, { passive: true });
    window.addEventListener("resize", requestRevealUpdate);

    return () => {
      window.removeEventListener("scroll", requestRevealUpdate);
      window.removeEventListener("lenis-scroll", requestRevealUpdate);
      window.removeEventListener("touchmove", requestRevealUpdate);
      window.removeEventListener("resize", requestRevealUpdate);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [locale, rooms.length]);

  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStart = e.target.value;
    setStartDate(newStart);
    // Auto-jump logic: Check-out must be at least the day after check-in
    if (new Date(newStart) >= new Date(endDate)) {
      setEndDate(getNextDay(newStart));
    }
    closeDatePicker(e.currentTarget);
  };

  const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEndDate(e.target.value);
    closeDatePicker(e.currentTarget);
  };

  const closeDatePicker = (input: HTMLInputElement | null) => {
    if (!input) return;
    input.blur();

    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    window.requestAnimationFrame(() => {
      input.blur();
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    });
  };

  const openDatePicker = (input: HTMLInputElement | null) => {
    if (!input) return;
    input.focus({ preventScroll: true });
    const withPicker = input as HTMLInputElement & { showPicker?: () => void };
    if (typeof withPicker.showPicker === "function") {
      withPicker.showPicker();
      return;
    }
    input.focus();
  };

  const sectionNavItems: Array<{ id: SectionId; label: string }> = [
    { id: "about", label: t.navbar.aboutUs },
    { id: "experience", label: t.navbar.experience },
    { id: "rooms", label: t.navbar.rooms },
    { id: "services", label: t.navbar.services },
    { id: "feedback", label: t.navbar.feedback },
    { id: "contact", label: t.navbar.contact },
  ];

  const scrollToSection = (id: SectionId) => {
    const section = document.getElementById(id);
    if (!section) return;
    section.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const experienceImages = [
    "/castle.jpeg",
    "/altmu.jpeg",
    "/conference.jpeg",
    "/spa.jpeg",
    "/breakfast.jpeg",
    "/chill.jpeg",
  ];
  const experienceGrid = t.home.experienceCards.map((card, index) => ({
    ...card,
    img: experienceImages[index] ?? "/lobby.jpeg",
  }));
  const servicesImages = [
    "/yoga.jpeg",
    "/drinks.png",
    "/conference.jpeg",
    "/spa.jpeg",
    "/drive.png",
    "/local_food.png",
  ];
  const servicesCards = t.home.servicesCards.map((card, index) => ({
    ...card,
    defaultDate: today,
    image: servicesImages[index] ?? "/lobby.jpeg",
    perPersonPricing: SERVICE_BOOKING_CONFIG[index]?.perPersonPricing ?? true,
    serviceCode: SERVICE_BOOKING_CONFIG[index]?.serviceCode ?? `service_${index + 1}`,
    timeSlots: SERVICE_BOOKING_CONFIG[index]?.timeSlots ?? SERVICE_TIME_SLOTS,
    unitPriceCents: SERVICE_BOOKING_CONFIG[index]?.unitPriceCents ?? 0,
  }));

  const getLocalizedRoomDescription = (room: Room) => {
    const localizedFromDb =
      room.description_i18n &&
      typeof room.description_i18n === "object" &&
      typeof room.description_i18n[locale] === "string"
        ? room.description_i18n[locale]
        : null;

    if (localizedFromDb && localizedFromDb.trim().length > 0) {
      return localizedFromDb;
    }

    const category = getRoomCategory(room.type);
    if (locale === "de" && category) {
      return t.home.roomDescriptionByCategory[category];
    }
    return room.description || t.home.roomFallbackDescription;
  };

  const roomCards = CATEGORY_ORDER.map((category) => {
    const roomsInCategory = rooms.filter((room) => getRoomCategory(room.type) === category);
    const representativeRoom = roomsInCategory[0] ?? null;
    const availabilityWindow = categoryAvailability[category] ?? [];
    const selectedDateAvailability =
      availabilityWindow.find((cell) => cell.day === startDate)?.available ?? null;
    const priceCents =
      roomsInCategory.length > 0
        ? Math.min(...roomsInCategory.map((room) => room.price_cents))
        : CATEGORY_DEFAULT_PRICE_CENTS[category];
    const localizedDescription = representativeRoom
      ? getLocalizedRoomDescription(representativeRoom)
      : t.home.roomDescriptionByCategory[category];

    return {
      availableCount: roomsInCategory.length,
      category,
      description: localizedDescription,
      image: CATEGORY_IMAGE[category],
      availabilityWindow,
      priceCents,
      selectedDateSoldOut: selectedDateAvailability === 0,
      title: t.home.roomTypeByCategory[category],
    };
  });

  return (
    <div className="flex flex-col gap-16 pb-16 md:gap-24 md:pb-24">
      <div className="pointer-events-none fixed right-3 top-1/2 z-40 hidden -translate-y-1/2 md:block">
        <div className="pointer-events-auto rounded-2xl border border-white/10 bg-[#0b1220]/55 p-2 backdrop-blur-xl shadow-[0_10px_24px_rgba(0,0,0,0.35)]">
          <div className="flex flex-col gap-1.5">
            {sectionNavItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => scrollToSection(item.id)}
                  className={`group flex items-center gap-2 rounded-xl px-2 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] transition-colors ${
                    isActive ? "text-white" : "text-white/45 hover:text-white/85"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full transition-all ${
                      isActive
                        ? "bg-[#a87f5d] scale-110 shadow-[0_0_10px_rgba(168,127,93,0.65)]"
                        : "bg-white/35 group-hover:bg-white/60"
                    }`}
                  />
                  <span
                    className={`transition-opacity ${
                      isActive ? "opacity-100" : "opacity-55 group-hover:opacity-95"
                    }`}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="reveal reveal-header">
        <Hero
          line1={t.hero.line1}
          line2={t.hero.line2}
          line3={t.hero.line3}
          subheadline={t.hero.subheadline}
        />
      </div>
      <div className="reveal reveal-header">
        <AboutUs
          paragraphs={t.about.paragraphs}
          pillars={t.about.pillars}
          titleHighlight={t.about.titleHighlight}
          titlePrefix={t.about.titlePrefix}
        />
      </div>

      <section id="experience" className="mx-auto w-full max-w-6xl px-4 pt-8 scroll-mt-24 md:pt-12">
        <div className="reveal reveal-header mb-10 text-center md:mb-12">
          <h2 className="font-serif text-3xl font-bold tracking-wide text-white uppercase sm:text-4xl">{t.home.experienceTitle}</h2>
          <div className="mx-auto mt-4 h-1 w-20 bg-[#3d2b1f]" />
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {experienceGrid.map((item, index) => (
            <div
              key={item.title}
              className="reveal reveal-card group relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/10 shadow-2xl sm:aspect-[5/4]"
              style={{ transitionDelay: `${index * 90}ms` }}
            >
              <Image
                src={item.img}
                alt={item.title}
                fill
                quality={74}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0b1220] via-transparent to-transparent opacity-90" />
              <div className="absolute bottom-6 left-6 text-left">
                <h3 className="text-lg font-bold text-white md:text-xl">{item.title}</h3>
                <p className="text-xs text-white/70 md:text-sm">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="rooms" className="mx-auto w-full max-w-6xl px-4 pt-8 scroll-mt-24 md:pt-12">
        <div className="reveal reveal-header mb-10 flex flex-col gap-6 border-l-4 border-[#3d2b1f] pl-4 text-left md:mb-12 md:flex-row md:items-end md:justify-between md:pl-6">
          <div>
            <h2 className="font-serif text-3xl font-bold tracking-tight text-white uppercase sm:text-4xl">{t.home.executiveTitle}</h2>
            <p className="mt-2 text-base text-white/60 md:text-lg">{t.home.executiveSubtitle}</p>
          </div>
          
          <div className="grid w-full grid-cols-1 gap-3 rounded-xl border border-white/10 bg-white/5 p-4 sm:max-w-md sm:grid-cols-2 sm:gap-4 md:w-auto md:max-w-[30rem]">
            <div className="relative flex flex-col gap-1 rounded-lg border border-white/10 bg-[#0b1220]/35 px-3 py-2">
              <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">{t.home.checkIn}</label>
              <input 
                type="date" 
                min={today}
                value={startDate}
                onChange={handleStartChange}
                data-testid="checkin-input"
                ref={startInputRef}
                className="date-input w-full border-none bg-transparent p-0 pr-8 text-sm text-white focus:ring-0"
              />
              <button
                type="button"
                onClick={() => openDatePicker(startInputRef.current)}
                aria-label={t.home.checkIn}
                className="absolute right-2 bottom-2 text-white/50 transition-colors hover:text-white"
              >
                <CalendarDays size={16} />
              </button>
            </div>
            <div className="relative flex flex-col gap-1 rounded-lg border border-white/10 bg-[#0b1220]/35 px-3 py-2">
              <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">{t.home.checkOut}</label>
              <input 
                type="date" 
                min={getNextDay(startDate)}
                value={endDate}
                onChange={handleEndChange}
                data-testid="checkout-input"
                ref={endInputRef}
                className="date-input w-full border-none bg-transparent p-0 pr-8 text-sm text-white focus:ring-0"
              />
              <button
                type="button"
                onClick={() => openDatePicker(endInputRef.current)}
                aria-label={t.home.checkOut}
                className="absolute right-2 bottom-2 text-white/50 transition-colors hover:text-white"
              >
                <CalendarDays size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
          {roomCards.map((card, index) => {
            return (
            <div
              key={card.category}
              data-testid="room-card"
              data-room-category={card.category}
              className="reveal reveal-card group h-full overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition-all hover:border-[#3d2b1f]/50"
              style={{ transitionDelay: `${index * 110}ms` }}
            >
              <div className="relative aspect-[16/7.4]">
                <Image
                  src={card.image}
                  alt={card.title}
                  fill
                  quality={76}
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover opacity-80 transition-opacity group-hover:opacity-100"
                />
                <div className="absolute bottom-2 left-2 rounded-lg border border-white/10 bg-[#0b1220]/80 px-2 py-0.5 backdrop-blur-md">
                  <p className="text-sm font-bold text-[#0ea5e9]">€{(card.priceCents / 100).toFixed(2)} {t.home.pricePerNight}</p>
                </div>
              </div>
              <div className="p-3 text-left md:p-3.5">
                <h3 className="min-h-[2.05rem] text-[1.18rem] leading-tight font-bold text-white [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] overflow-hidden md:min-h-[2.4rem] md:text-[1.45rem]">
                  {card.title}
                </h3>
                <p className="mt-1.5 min-h-[2.2rem] text-[13px] leading-relaxed text-white/50 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] overflow-hidden md:min-h-[2.5rem] md:text-sm">
                  {card.description}
                </p>
                <div className="mt-2">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/45">
                    {t.home.availabilityWindowTitle}
                  </p>
                  <div className="mt-1 grid grid-cols-7 gap-1">
                    {card.availabilityWindow.map((cell) => {
                      const isSelected = cell.day === startDate;
                      const soldOut = cell.available <= 0;

                      return (
                        <button
                          key={`${card.category}-${cell.day}`}
                          type="button"
                          onClick={() => {
                            setStartDate(cell.day);
                            setEndDate(getNextDay(cell.day));
                          }}
                          className={`rounded-md border px-1 py-1 text-center transition-all ${
                            soldOut
                              ? "border-red-500/30 bg-red-500/10 text-red-200/80 hover:border-red-400/60"
                              : isSelected
                              ? "border-[#a87f5d]/70 bg-[#3d2b1f]/45 text-[#f0dac2]"
                              : "border-white/10 bg-[#0b1220]/45 text-white/75 hover:border-[#a87f5d]/45 hover:text-white"
                          }`}
                        >
                          <span className="block text-[9px] font-bold uppercase leading-tight">
                            {availabilityDayFormatter.format(new Date(`${cell.day}T00:00:00`))}
                          </span>
                          <span className="block text-[9px] font-semibold leading-tight">
                            {soldOut ? t.home.soldOutShort : `${cell.available}/${cell.total}`}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="pt-1">
                  <BookRoomForm
                    roomCategory={card.category}
                    startDate={startDate}
                    endDate={endDate}
                    unavailable={card.availableCount === 0 || card.selectedDateSoldOut}
                    showWaitlist={card.availableCount === 0 || card.selectedDateSoldOut}
                    testId={`book-room-${card.category}`}
                  />
                </div>
              </div>
            </div>
            );
          })}
        </div>
      </section>

      <ServicesOffers
        title={t.home.servicesTitle}
        subtitle={t.home.servicesSubtitle}
        intro={t.home.servicesIntro}
        cards={servicesCards}
        bundlesTitle={t.home.bundlesTitle}
        bundlesSubtitle={t.home.bundlesSubtitle}
        bundles={t.home.bundles}
      />

      <GuestFeedback />

      <div className="reveal reveal-header">
        <ContactUs
          email={t.contact.email}
          journal={t.contact.journal}
          location={t.contact.location}
          locationLine1={t.contact.locationLine1}
          locationLine2={t.contact.locationLine2}
          stay={t.contact.stay}
          titleHighlight={t.contact.titleHighlight}
          titlePrefix={t.contact.titlePrefix}
        />
      </div>
    </div>
  );
}
