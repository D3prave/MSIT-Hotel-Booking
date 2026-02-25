// web/app/bookings/page.tsx
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { redirect } from "next/navigation";
import BookingActions from "@/components/booking/booking-actions";
import { getServerLocale } from "@/lib/i18n/server";
import { getRoomCategory, translations } from "@/lib/i18n/translations";

export const dynamic = "force-dynamic";

type RoomSummary = {
  price_cents: number;
  type: string;
};

type BookingRow = {
  end_date: string;
  id: string;
  room_id: string;
  rooms: RoomSummary | RoomSummary[] | null;
  start_date: string;
  status: string;
};

function getRoomSummary(rooms: BookingRow["rooms"]): RoomSummary | null {
  if (!rooms) return null;
  return Array.isArray(rooms) ? (rooms[0] ?? null) : rooms;
}

export default async function BookingsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  const locale = await getServerLocale();
  const t = translations[locale].bookings;

  if (!user) redirect("/login");

  const { data: bookings } = await supabase
    .from("bookings")
    .select("id, room_id, start_date, end_date, status, rooms ( type, price_cents )")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  const bookingRows = (bookings ?? []) as BookingRow[];

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-36 md:pt-40">
      <div className="mb-12 border-l-4 border-[#3d2b1f] pl-6">
        <h1 className="font-serif text-4xl font-bold text-white uppercase tracking-tight">{t.title}</h1>
        <p className="mt-2 text-white/50">{t.subtitle}</p>
      </div>

      <div className="space-y-6">
        {bookingRows.length === 0 && (
          <div className="p-12 text-center border border-dashed border-white/10 rounded-2xl">
            <p className="text-white/50 italic">{t.empty}</p>
          </div>
        )}

        {bookingRows.map((booking) => {
          const room = getRoomSummary(booking.rooms);
          const roomTypeFromDb = room?.type ?? t.roomFallback;
          const roomCategory = getRoomCategory(roomTypeFromDb);
          const roomType = roomCategory
            ? translations[locale].home.roomTypeByCategory[roomCategory]
            : roomTypeFromDb;
          const priceCents = room?.price_cents ?? 0;
          const start = new Date(booking.start_date);
          const end = new Date(booking.end_date);
          const nights = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)));
          const canCalculateTotal = priceCents > 0;
          const total = ((nights * priceCents) / 100).toFixed(2);

          return (
            <div
              key={booking.id}
              data-testid="booking-card"
              data-booking-id={booking.id}
              className="flex flex-col justify-between gap-6 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm md:flex-row md:items-center md:p-8"
            >
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white">{roomType}</h3>
                <p className="text-[#0ea5e9] font-mono text-sm mt-1">{booking.start_date} — {booking.end_date}</p>
                <span
                  data-testid={`booking-status-${booking.id}`}
                  className={`inline-block mt-4 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border ${
                  booking.status === "confirmed" ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-orange-500/10 text-orange-500 border-orange-500/20"
                }`}
                >
                  {t.status[booking.status as keyof typeof t.status] ?? booking.status}
                </span>
              </div>

              <div className="w-full min-w-0 text-left md:mt-0 md:w-[15rem] md:px-10 md:text-right">
                <p className="text-2xl font-bold text-white">{canCalculateTotal ? `€${total}` : t.totalPending}</p>
                <p className="text-xs text-white/30 uppercase">
                  {canCalculateTotal
                    ? `${t.totalValue} (${nights} ${nights === 1 ? t.nightSingular : t.nightPlural})`
                    : `${t.roomIdPrefix}: ${booking.room_id}`}
                </p>
              </div>

              <BookingActions bookingId={booking.id} status={booking.status} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
