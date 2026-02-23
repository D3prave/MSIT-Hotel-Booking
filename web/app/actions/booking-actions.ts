"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function handleBooking(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  
  // Get user session
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login?error=Unauthorized");
  }

  const roomId = formData.get("roomId") as string;
  // In a real app, you'd get dates from a date picker. 
  // For the prototype, we use a simple 1-night stay from today.
  const startDate = new Date().toISOString().split('T')[0];
  const endDate = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const { error } = await supabase
    .from("bookings")
    .insert({
      room_id: roomId,
      user_id: user.id,
      start_date: startDate,
      end_date: endDate,
      status: 'confirmed'
    });

  if (error) {
    console.error("Booking failed:", error.message);
    return { error: error.message };
  }

  revalidatePath("/bookings");
  redirect("/bookings");
}