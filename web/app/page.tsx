import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { Hero } from "@/components/marketing/hero";

export default async function HomePage() {
  const supabase = await createSupabaseServerClient();
  
  const { data: rooms, error } = await supabase
    .from("rooms")
    .select("*")
    .eq("is_available", true);

  if (error) {
    console.error("Error fetching rooms:", error);
  }

  return (
    <div className="flex flex-col gap-16 pb-16">
      <Hero />
      
      <section id="rooms" className="mx-auto max-w-6xl px-4 w-full">
        <h2 className="text-3xl font-bold mb-8 text-white">Available Rooms</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {rooms?.map((room) => (
            <div key={room.id} className="group rounded-xl border border-white/10 bg-white/5 p-6 transition-hover hover:bg-white/10">
              <div className="aspect-video w-full mb-4 rounded-lg bg-white/10 overflow-hidden">
                <img 
                  src={`https://placehold.co/600x400/0b1220/ffffff?text=${room.type.replace(" ", "+")}`} 
                  alt={room.type}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-xl font-bold text-white">{room.type}</h3>
              <p className="text-2xl font-bold text-[#0ea5e9] mt-2">
                ${(room.price_cents / 100).toFixed(2)} <span className="text-sm font-normal text-white/50">/ night</span>
              </p>
              
              <form action="/api/book" method="POST">
                <input type="hidden" name="roomId" value={room.id} />
                <button 
                  type="submit"
                  className="mt-6 w-full py-3 rounded-lg bg-[#0ea5e9] font-semibold text-white transition-opacity hover:opacity-90"
                >
                  Book Now
                </button>
              </form>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}