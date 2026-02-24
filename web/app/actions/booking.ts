// web/app/actions/booking.ts
"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type CreateBookingActionState = {
  error: string | null;
};

export type BookingMutationActionState = {
  error: string | null;
};

type BookingMutationRow = {
  id: string;
  status: string;
  user_id: string;
};

function getBookingIdFromFormData(formData: FormData): string | null {
  const value = formData.get("bookingId");
  if (typeof value !== "string" || value.trim().length === 0) return null;
  return value;
}

/** Creates a PENDING booking */
export async function createBooking(
  _previousState: CreateBookingActionState,
  formData: FormData
): Promise<CreateBookingActionState> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const roomId = formData.get("roomId") as string;
  const startDate = formData.get("startDate") as string;
  const endDate = formData.get("endDate") as string;
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  const today = new Date();
  today.setHours(0,0,0,0);

  // Validation: No past bookings, no invalid ranges
  if (start < today || start >= end) {
    return { error: "Please choose valid check-in and check-out dates." };
  }

  // Check availability using the updated RPC function
  const { data: isAvailable } = await supabase.rpc('is_room_available', {
    room_id_param: roomId,
    start_date_param: startDate,
    end_date_param: endDate
  });

  if (!isAvailable) {
    return { error: "This room is not available for the selected dates." };
  }

  const { error } = await supabase.from("bookings").insert({
    user_id: user.id,
    room_id: roomId,
    start_date: startDate,
    end_date: endDate,
    status: "pending", // Always start as pending
  });

  if (error) {
    return { error: "We could not complete your booking. Please try again." };
  }

  revalidatePath("/bookings");
  redirect("/bookings");
}

/** Finalizes a PENDING booking */
export async function confirmBooking(
  _previousState: BookingMutationActionState,
  formData: FormData
): Promise<BookingMutationActionState> {
  const bookingId = getBookingIdFromFormData(formData);
  if (!bookingId) {
    return { error: "Invalid booking id." };
  }

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .select("id, status, user_id")
    .eq("id", bookingId)
    .maybeSingle();

  if (bookingError) {
    return { error: "Could not find this booking right now. Please refresh and try again." };
  }
  if (!booking) {
    return { error: "Booking no longer exists." };
  }

  const typedBooking = booking as BookingMutationRow;
  if (typedBooking.user_id !== user.id) {
    return { error: "You are not allowed to update this booking." };
  }

  if (typedBooking.status === "confirmed") {
    revalidatePath("/bookings");
    redirect("/bookings");
  }

  const { error: updateError } = await supabase
    .from("bookings")
    .update({ status: "confirmed" })
    .eq("id", bookingId);

  if (updateError) {
    return { error: "Could not confirm booking due to a database write error." };
  }

  const { data: verifyRow, error: verifyError } = await supabase
    .from("bookings")
    .select("status")
    .eq("id", bookingId)
    .maybeSingle();

  if (verifyError) {
    return { error: "Booking update could not be verified. Please refresh and check status." };
  }
  if (!verifyRow || verifyRow.status !== "confirmed") {
    return { error: "Booking update was blocked by database permissions. Please allow UPDATE on bookings for the owner." };
  }

  revalidatePath("/bookings");
  redirect("/bookings");
}

/** Removes/Cancels a booking */
export async function deleteBooking(
  _previousState: BookingMutationActionState,
  formData: FormData
): Promise<BookingMutationActionState> {
  const bookingId = getBookingIdFromFormData(formData);
  if (!bookingId) {
    return { error: "Invalid booking id." };
  }

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .select("id, status, user_id")
    .eq("id", bookingId)
    .maybeSingle();

  if (bookingError) {
    return { error: "Could not find this booking right now. Please refresh and try again." };
  }
  if (!booking) {
    return { error: "Booking no longer exists." };
  }

  const typedBooking = booking as BookingMutationRow;
  if (typedBooking.user_id !== user.id) {
    return { error: "You are not allowed to remove this booking." };
  }

  const { error: deleteError } = await supabase
    .from("bookings")
    .delete()
    .eq("id", bookingId);

  if (deleteError) {
    return { error: "Could not remove booking due to a database write error." };
  }

  const { data: verifyRow, error: verifyError } = await supabase
    .from("bookings")
    .select("id")
    .eq("id", bookingId)
    .maybeSingle();

  if (verifyError) {
    return { error: "Booking removal could not be verified. Please refresh and check again." };
  }
  if (verifyRow) {
    return { error: "Booking removal was blocked by database permissions. Please allow DELETE on bookings for the owner." };
  }

  revalidatePath("/bookings");
  redirect("/bookings");
}
