import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { getServerLocale } from "@/lib/i18n/server";
import { getRoomCategory, type RoomCategory, translations } from "@/lib/i18n/translations";
import { isAdminUser } from "@/lib/auth/admin";

export const dynamic = "force-dynamic";

type RoomRow = {
  id: string;
  is_available: boolean;
  price_cents: number;
  type: string;
};

type BookingRow = {
  end_date: string;
  room_id: string;
  start_date: string;
  status: string;
};

const CATEGORY_ORDER: RoomCategory[] = ["economy", "superior", "deluxe", "attic"];

function toDateOnly(date: Date) {
  return date.toISOString().slice(0, 10);
}

function addDays(dateString: string, days: number) {
  const date = new Date(`${dateString}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return toDateOnly(date);
}

function daysBetween(startDate: string, endDate: string) {
  const start = new Date(`${startDate}T00:00:00Z`);
  const end = new Date(`${endDate}T00:00:00Z`);
  return Math.max(0, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
}

function overlapNights(
  bookingStart: string,
  bookingEnd: string,
  rangeStart: string,
  rangeEnd: string
) {
  const start = bookingStart > rangeStart ? bookingStart : rangeStart;
  const end = bookingEnd < rangeEnd ? bookingEnd : rangeEnd;
  if (start >= end) return 0;
  return daysBetween(start, end);
}

function overlapsRange(
  bookingStart: string,
  bookingEnd: string,
  rangeStart: string,
  rangeEnd: string
) {
  return bookingStart < rangeEnd && bookingEnd > rangeStart;
}

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

function formatCurrency(value: number, locale: string) {
  return new Intl.NumberFormat(locale, {
    currency: "EUR",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(value);
}

export default async function AdminPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  const locale = await getServerLocale();
  const t = translations[locale].admin;

  if (!user) redirect("/login");
  if (!isAdminUser(user)) redirect("/");

  const today = toDateOnly(new Date());
  const weekStart = today;
  const horizonEnd = addDays(weekStart, 7);
  const days = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
  const dateFormatter = new Intl.DateTimeFormat(locale === "de" ? "de-DE" : "en-US", {
    day: "2-digit",
    month: "2-digit",
    weekday: "short",
  });

  const [{ data: roomsData }, { data: bookingsData }] = await Promise.all([
    supabase.from("rooms").select("id, type, price_cents, is_available"),
    supabase
      .from("bookings")
      .select("room_id, start_date, end_date, status")
      .in("status", ["pending", "confirmed"])
      .lt("start_date", horizonEnd)
      .gt("end_date", today),
  ]);

  const rooms = (roomsData ?? []) as RoomRow[];
  const bookings = (bookingsData ?? []) as BookingRow[];
  const activeRooms = rooms.filter((room) => room.is_available);

  const categoryRoomIds = Object.fromEntries(
    CATEGORY_ORDER.map((category) => [category, [] as string[]])
  ) as Record<RoomCategory, string[]>;
  const roomPriceById = new Map<string, number>();
  const roomCategoryById = new Map<string, RoomCategory>();

  for (const room of rooms) {
    roomPriceById.set(room.id, room.price_cents);
    const category = getRoomCategory(room.type);
    if (!category || !room.is_available) continue;
    categoryRoomIds[category].push(room.id);
    roomCategoryById.set(room.id, category);
  }

  const activeRoomIdSet = new Set(activeRooms.map((room) => room.id));
  const relevantBookings = bookings.filter((booking) => activeRoomIdSet.has(booking.room_id));
  const todayEnd = addDays(today, 1);

  const occupiedTodaySet = new Set<string>();
  for (const booking of relevantBookings) {
    if (overlapsRange(booking.start_date, booking.end_date, today, todayEnd)) {
      occupiedTodaySet.add(booking.room_id);
    }
  }

  const occupancyTodayPct =
    activeRooms.length > 0 ? (occupiedTodaySet.size / activeRooms.length) * 100 : 0;

  let weekPctAccumulator = 0;
  for (const day of days) {
    const dayEnd = addDays(day, 1);
    const occupiedSet = new Set<string>();
    for (const booking of relevantBookings) {
      if (overlapsRange(booking.start_date, booking.end_date, day, dayEnd)) {
        occupiedSet.add(booking.room_id);
      }
    }
    weekPctAccumulator += activeRooms.length > 0 ? (occupiedSet.size / activeRooms.length) * 100 : 0;
  }

  const avgWeekOccupancy = days.length > 0 ? weekPctAccumulator / days.length : 0;

  let projectedRevenueCents = 0;
  for (const booking of relevantBookings) {
    if (booking.status !== "confirmed") continue;
    const nights = overlapNights(booking.start_date, booking.end_date, weekStart, horizonEnd);
    if (nights <= 0) continue;
    const price = roomPriceById.get(booking.room_id) ?? 0;
    projectedRevenueCents += nights * price;
  }

  const categoryRows = CATEGORY_ORDER.map((category) => {
    const roomIds = categoryRoomIds[category];
    const roomSet = new Set(roomIds);
    const total = roomIds.length;
    const perDay = days.map((day) => {
      const dayEnd = addDays(day, 1);
      const occupiedSet = new Set<string>();
      for (const booking of relevantBookings) {
        if (!roomSet.has(booking.room_id)) continue;
        if (overlapsRange(booking.start_date, booking.end_date, day, dayEnd)) {
          occupiedSet.add(booking.room_id);
        }
      }

      return {
        occupied: occupiedSet.size,
        total,
      };
    });

    return {
      category,
      displayName: translations[locale].home.roomTypeByCategory[category],
      perDay,
      total,
    };
  });

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-36 md:pt-40">
      <div className="mb-10 border-l-4 border-[#3d2b1f] pl-6">
        <h1 className="font-serif text-4xl font-bold text-white uppercase tracking-tight">{t.title}</h1>
        <p className="mt-2 text-white/55">{t.subtitle}</p>
      </div>

      <section className="mb-10">
        <h2 className="mb-4 text-xs font-black uppercase tracking-[0.2em] text-white/40">{t.analyticsTitle}</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">{t.totalActiveRooms}</p>
            <p className="mt-2 text-3xl font-black text-white">{activeRooms.length}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">{t.occupancyToday}</p>
            <p className="mt-2 text-3xl font-black text-white">{formatPercent(occupancyTodayPct)}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">{t.avgWeekOccupancy}</p>
            <p className="mt-2 text-3xl font-black text-white">{formatPercent(avgWeekOccupancy)}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">{t.next7Revenue}</p>
            <p className="mt-2 text-3xl font-black text-white">{formatCurrency(projectedRevenueCents / 100, locale === "de" ? "de-DE" : "en-US")}</p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/5 p-4 md:p-6">
        <h2 className="mb-1 text-sm font-black uppercase tracking-[0.12em] text-white">{t.calendarTitle}</h2>
        <p className="mb-4 text-xs text-white/45">{t.calendarLegend}</p>

        <div className="overflow-x-auto">
          <table className="min-w-[760px] w-full border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-left">
                <th className="px-3 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-white/40">{t.category}</th>
                {days.map((day, index) => (
                  <th key={day} className="px-3 py-3 text-[10px] font-black uppercase tracking-[0.14em] text-white/40">
                    {t.dayPrefix} {index + 1}
                    <div className="mt-1 text-[11px] font-semibold tracking-normal text-white/70">
                      {dateFormatter.format(new Date(`${day}T00:00:00Z`))}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {categoryRows.map((row) => (
                <tr key={row.category} className="border-b border-white/5 last:border-b-0">
                  <td className="px-3 py-3 text-sm font-bold text-white">{row.displayName}</td>
                  {row.perDay.map((cell, index) => {
                    const ratio = cell.total > 0 ? cell.occupied / cell.total : 0;
                    const cellClass =
                      ratio >= 0.85
                        ? "bg-red-500/15 text-red-200 border-red-500/30"
                        : ratio >= 0.6
                        ? "bg-amber-500/15 text-amber-100 border-amber-500/30"
                        : "bg-emerald-500/15 text-emerald-100 border-emerald-500/30";

                    return (
                      <td key={`${row.category}-${index}`} className="px-3 py-3">
                        <div className={`rounded-lg border px-2 py-1 text-xs font-bold text-center ${cellClass}`}>
                          {cell.occupied}/{cell.total}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
