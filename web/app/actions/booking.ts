// web/app/actions/booking.ts
"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createBooking(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const roomId = formData.get("roomId") as string;
  // Defaulting to a 1-night stay for the prototype
  const startDate = new Date().toISOString().split("T")[0];
  const endDate = new Date(Date.now() + 86400000).toISOString().split("T")[0];

  const { error } = await supabase.from("bookings").insert({
    user_id: user.id,
    room_id: roomId,
    start_date: startDate,
    end_date: endDate,
    status: "confirmed",
  });

  if (error) {
    console.error("Booking failed:", error.message);
    return { error: error.message };
  }

  revalidatePath("/bookings");
  redirect("/bookings");
}