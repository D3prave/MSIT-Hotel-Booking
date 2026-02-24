// web/app/page.tsx
"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { Hero } from "@/components/marketing/hero";
import { AboutUs } from "@/components/marketing/about-us";
import { ContactUs } from "@/components/marketing/contact-us";
import BookRoomForm from "@/components/booking/book-room-form";

type Room = {
  description: string | null;
  id: string;
  is_available: boolean;
  price_cents: number;
  type: string;
};

export default function HomePage() {
  const supabase = createSupabaseBrowserClient();

  const [rooms, setRooms] = useState<Room[]>([]);
  const today = new Date().toISOString().split("T")[0];
  const [startDate, setStartDate] = useState(today);

  const getNextDay = (dateStr: string) => {
    const d = new Date(dateStr);
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  };

  const [endDate, setEndDate] = useState(getNextDay(today));

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

  const getRoomImage = (type: string) => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes('deluxe')) return '/deluxe.jpeg';
    if (lowerType.includes('suite')) return '/suite.jpeg';
    if (lowerType.includes('superior')) return '/superior.jpeg';
    if (lowerType.includes('economy')) return '/economy.jpeg';
    return '/default-room.jpeg';
  };

  const experienceGrid = [
    { title: "Kipfenberg Castle", img: "/castle.jpeg", desc: "Historic views overlooking the Altmuhltal." },
    { title: "Altmuhltal Drive", img: "/altmu.jpeg", desc: "Panoramic routes for classic car enthusiasts." },
    { title: "Executive Focus", img: "/conference.jpeg", desc: "Professional infrastructure for focus." },
    { title: "Deep Recovery", img: "/spa.jpeg", desc: "Finnish sauna and whirlpool relaxation." },
    { title: "Bavarian Breakfast", img: "/breakfast.jpeg", desc: "Regional flavors to power your day." },
    { title: "Leisure & Spirits", img: "/chill.jpeg", desc: "Billiards and local drinks in our chill area." },
  ];

  return (
    <div className="flex flex-col gap-16 pb-16 md:gap-24 md:pb-24">
      <Hero />
      <AboutUs />

      <section id="experience" className="mx-auto w-full max-w-6xl px-4 pt-8 scroll-mt-24 md:pt-12">
        <div className="mb-10 text-center md:mb-12">
          <h2 className="font-serif text-3xl font-bold tracking-wide text-white uppercase sm:text-4xl">The DENKRAUM Experience</h2>
          <div className="mx-auto mt-4 h-1 w-20 bg-[#3d2b1f]" />
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {experienceGrid.map((item) => (
            <div key={item.title} className="group relative h-64 overflow-hidden rounded-2xl border border-white/10 shadow-2xl sm:h-72 md:h-80">
              <img src={item.img} alt={item.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0b1220] via-transparent to-transparent opacity-90" />
              <div className="absolute bottom-6 left-6 text-left">
                <h3 className="text-lg font-bold text-white md:text-xl">{item.title}</h3>
                <p className="text-xs text-white/70 md:text-sm">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="rooms" className="mx-auto w-full max-w-6xl px-4 pt-8 scroll-mt-24 md:pt-12">
        <div className="mb-10 flex flex-col gap-6 border-l-4 border-[#3d2b1f] pl-4 text-left md:mb-12 md:flex-row md:items-end md:justify-between md:pl-6">
          <div>
            <h2 className="font-serif text-3xl font-bold tracking-tight text-white uppercase sm:text-4xl">Executive Retreats</h2>
            <p className="mt-2 text-base text-white/60 md:text-lg">25 designer rooms in our historic 1886 farmhouse.</p>
          </div>
          
          <div className="grid w-full grid-cols-1 gap-3 rounded-xl border border-white/10 bg-white/5 p-4 sm:max-w-md sm:grid-cols-2 sm:gap-4 md:w-auto md:min-w-[26rem]">
            <div className="flex flex-col gap-1 rounded-lg border border-white/10 bg-[#0b1220]/35 px-3 py-2">
              <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Check In</label>
              <input 
                type="date" 
                min={today}
                value={startDate}
                onChange={handleStartChange}
                className="w-full border-none bg-transparent p-0 text-sm text-white focus:ring-0 [color-scheme:dark]"
              />
            </div>
            <div className="flex flex-col gap-1 rounded-lg border border-white/10 bg-[#0b1220]/35 px-3 py-2">
              <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Check Out</label>
              <input 
                type="date" 
                min={getNextDay(startDate)}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full border-none bg-transparent p-0 text-sm text-white focus:ring-0 [color-scheme:dark]"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
          {rooms.map((room) => (
            <div key={room.id} className="group overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition-all hover:border-[#3d2b1f]/50">
              <div className="relative aspect-[16/9.4]">
                <img src={getRoomImage(room.type)} alt={room.type} className="h-full w-full object-cover opacity-80 transition-opacity group-hover:opacity-100" />
                <div className="absolute bottom-3 left-3 rounded-lg border border-white/10 bg-[#0b1220]/80 px-3 py-1 backdrop-blur-md">
                  <p className="font-bold text-[#0ea5e9]">€{(room.price_cents / 100).toFixed(2)} / night</p>
                </div>
              </div>
              <div className="p-5 text-left md:p-6">
                <h3 className="text-xl font-bold text-white md:text-2xl">{room.type}</h3>
                <p className="mb-4 mt-2 min-h-[2.2rem] text-[13px] leading-relaxed text-white/50 md:mb-5 md:min-h-[2.5rem] md:text-sm">
                  {room.description || "Premium workspace and farmhouse charm."}
                </p>
                <BookRoomForm roomId={room.id} startDate={startDate} endDate={endDate} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <ContactUs />
    </div>
  );
}
