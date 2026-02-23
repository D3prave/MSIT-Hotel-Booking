// web/app/page.tsx
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { Hero } from "@/components/marketing/hero";
import { createBooking } from "./actions/booking";
import { siteConfig } from "@/config/site-config";

export default async function HomePage() {
  const supabase = await createSupabaseServerClient();
  const { data: rooms } = await supabase.from("rooms").select("*").eq("is_available", true);

  const experienceGrid = [
    { title: "Kipfenberg Castle", img: "/kipfenberg-castle.jpeg", desc: "Historic views overlooking the Altmühltal." },
    { title: "Altmühltal Drive", img: "/altmuhltal-drive.jpeg", desc: "Panoramic routes for classic car enthusiasts." },
    { title: "Executive Focus", img: "/conference.jpeg", desc: "Fully equipped conference and work areas." },
    { title: "Deep Recovery", img: "/spa.jpeg", desc: "Finnish sauna and whirlpool relaxation." },
    { title: "Bavarian Breakfast", img: "/breakfast.jpeg", desc: "Regional flavors to power your workday." },
    { title: "Leisure & Spirits", img: "/chill.jpeg", desc: "Chill area with billiards and regional drinks." },
  ];

  return (
    <div className="flex flex-col gap-24 pb-24">
      <Hero />

      {/* 6-Photo Experience Grid */}
      <section id="experience" className="mx-auto max-w-6xl px-4 w-full">
        <div className="mb-12 text-center">
          <h2 className="font-serif text-4xl font-bold text-white">The DENKRAUM Experience</h2>
          <div className="mx-auto mt-4 h-1 w-20 bg-[#3d2b1f]"></div>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {experienceGrid.map((item) => (
            <div key={item.title} className="group relative h-80 overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
              <img 
                src={item.img} 
                alt={item.title} 
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0b1220] via-transparent to-transparent opacity-90" />
              <div className="absolute bottom-6 left-6">
                <h3 className="text-xl font-bold text-white">{item.title}</h3>
                <p className="text-sm text-white/70">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Rooms Section */}
      <section id="rooms" className="mx-auto max-w-6xl px-4 w-full">
        <div className="mb-12 border-l-4 border-[#3d2b1f] pl-6">
          <h2 className="font-serif text-4xl font-bold text-white tracking-tight">Executive Retreats</h2>
          <p className="mt-2 text-white/60 text-lg">25 designer rooms in our historic 1886 farmhouse.</p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {rooms?.map((room) => (
            <div key={room.id} className="group overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition-all hover:border-[#3d2b1f]/50">
              <div className="relative aspect-[16/10]">
                <img 
                  src="/room-standard.jpeg" 
                  alt={room.type} 
                  className="h-full w-full object-cover opacity-80 transition-opacity group-hover:opacity-100" 
                />
                <div className="absolute bottom-4 left-4 rounded-lg border border-white/10 bg-[#0b1220]/80 px-3 py-1 backdrop-blur-md">
                  <p className="font-bold text-[#0ea5e9]">
                    ${(room.price_cents / 100).toFixed(2)} / night
                  </p>
                </div>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold text-white">{room.type}</h3>
                <p className="mb-8 mt-2 text-sm text-white/50 leading-relaxed">
                  High-speed workstation and premium amenities in a quiet, rural setting.
                </p>
                <form action={createBooking}>
                  <input type="hidden" name="roomId" value={room.id} />
                  <button 
                    type="submit" 
                    className="w-full rounded-xl bg-[#3d2b1f] py-4 text-xs font-bold uppercase tracking-widest text-white transition-all hover:bg-opacity-80"
                  >
                    Confirm Reservation
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}