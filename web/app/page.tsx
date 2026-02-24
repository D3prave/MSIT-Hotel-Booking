import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { Hero } from "@/components/marketing/hero";
import { AboutUs } from "@/components/marketing/about-us";
import { ContactUs } from "@/components/marketing/contact-us";
import { createBooking } from "./actions/booking";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = await createSupabaseServerClient();
  
  const { data: rooms, error } = await supabase
    .from("rooms")
    .select("*")
    .eq("is_available", true);

  const getRoomImage = (type: string) => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes('economy')) return '/economy.jpeg';
    if (lowerType.includes('suite')) return '/suite.jpeg';
    if (lowerType.includes('superior')) return '/superior.jpeg';
    if (lowerType.includes('deluxe')) return '/deluxe.jpeg';
    return '/room-standard.jpeg';
  };

  const experienceGrid = [
    { title: "Kipfenberg Castle", img: "/castle.jpeg", desc: "Historic views overlooking the Altmühltal." },
    { title: "Altmühltal Drive", img: "/altmu.jpeg", desc: "Panoramic routes for classic car enthusiasts." },
    { title: "Executive Focus", img: "/conference.jpeg", desc: "Professional infrastructure for focus." },
    { title: "Deep Recovery", img: "/spa.jpeg", desc: "Finnish sauna and whirlpool relaxation." },
    { title: "Bavarian Breakfast", img: "/breakfast.jpeg", desc: "Regional flavors to power your day." },
    { title: "Leisure & Spirits", img: "/chill.jpeg", desc: "Billiards and local drinks in our chill area." },
  ];

  return (
    <div className="flex flex-col gap-24 pb-24">
      <Hero />

      {/* About Section */}
      <AboutUs />

      {/* Experience Grid Section */}
      <section id="experience" className="mx-auto max-w-6xl px-4 w-full pt-12">
        <div className="mb-12 text-center">
          <h2 className="font-serif text-4xl font-bold text-white uppercase tracking-wider">The DENKRAUM Experience</h2>
          <div className="mx-auto mt-4 h-1 w-20 bg-[#3d2b1f]"></div>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {experienceGrid.map((item) => (
            <div key={item.title} className="group relative h-80 overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
              <img src={item.img} alt={item.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0b1220] via-transparent to-transparent opacity-90" />
              <div className="absolute bottom-6 left-6 text-left">
                <h3 className="text-xl font-bold text-white">{item.title}</h3>
                <p className="text-sm text-white/70">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Rooms Section */}
      <section id="rooms" className="mx-auto max-w-6xl px-4 w-full pt-12">
        <div className="mb-12 border-l-4 border-[#3d2b1f] pl-6 text-left">
          <h2 className="font-serif text-4xl font-bold text-white tracking-tight uppercase">Executive Retreats</h2>
          <p className="mt-2 text-white/60 text-lg">25 designer rooms in our historic 1886 farmhouse.</p>
        </div>

        {error && <div className="p-4 bg-red-500/10 text-red-500 rounded-xl mb-6">Database Error: {error.message}</div>}

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {rooms && rooms.length > 0 ? (
            rooms.map((room) => (
              <div key={room.id} className="group overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition-all hover:border-[#3d2b1f]/50">
                <div className="relative aspect-[16/10]">
                  <img src={getRoomImage(room.type)} alt={room.type} className="h-full w-full object-cover opacity-80 transition-opacity group-hover:opacity-100" />
                  <div className="absolute bottom-4 left-4 rounded-lg border border-white/10 bg-[#0b1220]/80 px-3 py-1 backdrop-blur-md">
                    <p className="font-bold text-[#0ea5e9]">${(room.price_cents / 100).toFixed(2)} / night</p>
                  </div>
                </div>
                <div className="p-8 text-left">
                  <h3 className="text-2xl font-bold text-white">{room.type}</h3>
                  <p className="mb-8 mt-2 text-sm text-white/50 leading-relaxed min-h-[3rem]">
                    {room.description || "Premium workspace and farmhouse charm."}
                  </p>
                  <form action={createBooking}>
                    <input type="hidden" name="roomId" value={room.id} />
                    <button type="submit" className="w-full rounded-xl bg-[#3d2b1f] py-4 text-xs font-bold uppercase tracking-widest text-white transition-all hover:bg-opacity-80">
                      Confirm Reservation
                    </button>
                  </form>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-24 border border-dashed border-white/10 rounded-2xl text-white/50 italic">
              No active rooms found in the Kipfenberg estate.
            </div>
          )}
        </div>
      </section>

      {/* Contact Section */}
      <ContactUs />
    </div>
  );
}