// web/app/page.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { CalendarDays } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { Hero } from "@/components/marketing/hero";
import { AboutUs } from "@/components/marketing/about-us";
import { ContactUs } from "@/components/marketing/contact-us";
import BookRoomForm from "@/components/booking/book-room-form";
import { useLanguage } from "@/components/providers/language-provider";
import { getRoomCategory, type RoomCategory } from "@/lib/i18n/translations";

type Room = {
  description: string | null;
  description_i18n?: Record<string, string> | null;
  id: string;
  is_available: boolean;
  price_cents: number;
  type: string;
};

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

export default function HomePage() {
  const supabase = createSupabaseBrowserClient();
  const { locale, t } = useLanguage();

  const [rooms, setRooms] = useState<Room[]>([]);
  const today = getTodayLocalDateInputValue();
  const [startDate, setStartDate] = useState(getTodayLocalDateInputValue);
  const [endDate, setEndDate] = useState(() => getNextDay(getTodayLocalDateInputValue()));
  const startInputRef = useRef<HTMLInputElement>(null);
  const endInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchRooms = async () => {
      const { data } = await supabase.from("rooms").select("*").eq("is_available", true);
      if (data) setRooms(data as Room[]);
    };
    fetchRooms();
  }, [supabase]);

  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStart = e.target.value;
    setStartDate(newStart);
    // Auto-jump logic: Check-out must be at least the day after check-in
    if (new Date(newStart) >= new Date(endDate)) {
      setEndDate(getNextDay(newStart));
    }
  };

  const openDatePicker = (input: HTMLInputElement | null) => {
    if (!input) return;
    const withPicker = input as HTMLInputElement & { showPicker?: () => void };
    if (typeof withPicker.showPicker === "function") {
      withPicker.showPicker();
      return;
    }
    input.focus();
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
      priceCents,
      title: t.home.roomTypeByCategory[category],
    };
  });

  return (
    <div className="flex flex-col gap-16 pb-16 md:gap-24 md:pb-24">
      <Hero
        line1={t.hero.line1}
        line2={t.hero.line2}
        line3={t.hero.line3}
        subheadline={t.hero.subheadline}
      />
      <AboutUs
        paragraphs={t.about.paragraphs}
        pillars={t.about.pillars}
        titleHighlight={t.about.titleHighlight}
        titlePrefix={t.about.titlePrefix}
      />

      <section id="experience" className="mx-auto w-full max-w-6xl px-4 pt-8 scroll-mt-24 md:pt-12">
        <div className="mb-10 text-center md:mb-12">
          <h2 className="font-serif text-3xl font-bold tracking-wide text-white uppercase sm:text-4xl">{t.home.experienceTitle}</h2>
          <div className="mx-auto mt-4 h-1 w-20 bg-[#3d2b1f]" />
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {experienceGrid.map((item) => (
            <div key={item.title} className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/10 shadow-2xl sm:aspect-[5/4]">
              <Image
                src={item.img}
                alt={item.title}
                fill
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
        <div className="mb-10 flex flex-col gap-6 border-l-4 border-[#3d2b1f] pl-4 text-left md:mb-12 md:flex-row md:items-end md:justify-between md:pl-6">
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
                onChange={(e) => setEndDate(e.target.value)}
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

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
          {roomCards.map((card) => {
            return (
            <div
              key={card.category}
              data-testid="room-card"
              data-room-category={card.category}
              className="group h-full overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition-all hover:border-[#3d2b1f]/50"
            >
              <div className="relative aspect-[16/9]">
                <Image
                  src={card.image}
                  alt={card.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover opacity-80 transition-opacity group-hover:opacity-100"
                />
                <div className="absolute bottom-3 left-3 rounded-lg border border-white/10 bg-[#0b1220]/80 px-3 py-1 backdrop-blur-md">
                  <p className="font-bold text-[#0ea5e9]">€{(card.priceCents / 100).toFixed(2)} {t.home.pricePerNight}</p>
                </div>
              </div>
              <div className="p-4 text-left md:p-5">
                <h3 className="min-h-[2.6rem] text-xl leading-tight font-bold text-white [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] overflow-hidden md:min-h-[3rem] md:text-2xl">
                  {card.title}
                </h3>
                <p className="mt-2 min-h-[3.2rem] text-[13px] leading-relaxed text-white/50 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3] overflow-hidden md:min-h-[3.6rem] md:text-sm">
                  {card.description}
                </p>
                <div className="pt-0 md:pt-0">
                  <BookRoomForm
                    roomCategory={card.category}
                    startDate={startDate}
                    endDate={endDate}
                    unavailable={card.availableCount === 0}
                    testId={`book-room-${card.category}`}
                  />
                </div>
              </div>
            </div>
            );
          })}
        </div>
      </section>

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
  );
}
