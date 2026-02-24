// web/app/bookings/page.tsx
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function BookingsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Pobieranie rezerwacji zalogowanego użytkownika wraz z danymi pokoi
  const { data: bookings } = await supabase
    .from("bookings")
    .select(`
      id,
      start_date,
      end_date,
      status,
      rooms (
        type,
        price_cents
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <div className="mb-12 border-l-4 border-[#3d2b1f] pl-6">
        <h1 className="font-serif text-4xl font-bold text-white uppercase tracking-tight">Your DENKRAUM Stays</h1>
        <p className="mt-2 text-white/50">Manage your executive retreats and leisure plans.</p>
      </div>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
        {/* Lista rezerwacji */}
        <div className="lg:col-span-2 space-y-6">
          {bookings && bookings.length > 0 ? (
            bookings.map((booking: any) => (
              <div key={booking.id} className="flex flex-col md:flex-row justify-between items-start md:items-center p-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
                <div>
                  <h3 className="text-xl font-bold text-white">{booking.rooms.type}</h3>
                  <p className="text-[#0ea5e9] font-mono text-sm mt-1">
                    {booking.start_date} — {booking.end_date}
                  </p>
                  <span className="inline-block mt-4 px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-xs font-bold uppercase tracking-widest border border-green-500/20">
                    {booking.status}
                  </span>
                </div>
                <div className="mt-6 md:mt-0 text-left md:text-right">
                  <p className="text-2xl font-bold text-white">${(booking.rooms.price_cents / 100).toFixed(2)}</p>
                  <p className="text-xs text-white/30 uppercase">Total Professional Rate</p>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center border border-dashed border-white/10 rounded-2xl">
              <p className="text-white/50 italic">No active bookings found.</p>
            </div>
          )}
        </div>

        {/* Sekcja Heritage Tour / Kipfenberg Castle */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
            <img 
              src="/castle.jpeg" 
              alt="Kipfenberg Castle" 
              className="w-full h-48 object-cover opacity-80"
            />
            <div className="p-6">
              <h3 className="text-lg font-bold text-white font-serif italic">The Heritage Drive</h3>
              <p className="text-sm text-white/50 mt-2 leading-relaxed">
                As a DENKRAUM guest, you have exclusive access to our "Altmühltal Classic" route. 
                The Kipfenberg Castle is just 5 minutes away.
              </p>
              <button className="w-full mt-6 py-3 rounded-xl border border-[#3d2b1f] text-[#3d2b1f] font-bold text-xs uppercase tracking-widest hover:bg-[#3d2b1f] hover:text-white transition-all">
                Download GPS Route
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}