import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { redirect } from "next/navigation";

export default async function BookingsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/");

  // Fetch bookings with room details using foreign key relationship
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
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 text-white">My Bookings</h1>
      
      <div className="space-y-4">
        {bookings?.length === 0 && (
          <p className="text-white/50">You have no active bookings.</p>
        )}
        
        {bookings?.map((booking: any) => (
          <div key={booking.id} className="flex justify-between items-center p-6 rounded-xl border border-white/10 bg-white/5">
            <div>
              <h3 className="text-lg font-bold text-white">{booking.rooms.type}</h3>
              <p className="text-sm text-white/50">{booking.start_date} — {booking.end_date}</p>
            </div>
            <div className="text-right">
              <p className="font-mono text-[#0ea5e9]">Confirmed</p>
              <p className="text-sm text-white/70">${(booking.rooms.price_cents / 100).toFixed(2)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}