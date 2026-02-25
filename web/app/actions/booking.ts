// web/app/actions/booking.ts
"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerLocale } from "@/lib/i18n/server";
import {
  getRoomCategory,
  isRoomCategory,
  translations,
} from "@/lib/i18n/translations";
import { sendBookingEmail } from "@/lib/notifications/email";

export type CreateBookingActionState = {
  error: string | null;
  success: string | null;
};

export type BookingMutationActionState = {
  error: string | null;
  success: string | null;
};

type BookingMutationRow = {
  end_date: string;
  id: string;
  room_id: string;
  start_date: string;
  status: string;
  user_id: string;
};

type RoomLookupRow = {
  id: string;
  type: string;
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
  const locale = await getServerLocale();
  const t = translations[locale].actions;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const roomIdValue = formData.get("roomId");
  const roomCategoryValue = formData.get("roomCategory");
  const startDateValue = formData.get("startDate");
  const endDateValue = formData.get("endDate");
  const roomId =
    typeof roomIdValue === "string" && roomIdValue.trim().length > 0
      ? roomIdValue.trim()
      : null;
  const roomCategory =
    typeof roomCategoryValue === "string" && isRoomCategory(roomCategoryValue)
      ? roomCategoryValue
      : null;

  if (
    typeof startDateValue !== "string" ||
    typeof endDateValue !== "string"
  ) {
    return { error: t.invalidDates, success: null };
  }

  const startDate = startDateValue;
  const endDate = endDateValue;
  let selectedRoomId = roomId;
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  const today = new Date();
  today.setHours(0,0,0,0);

  // Validation: No past bookings, no invalid ranges
  if (start < today || start >= end) {
    return { error: t.invalidDates, success: null };
  }

  if (!selectedRoomId && roomCategory) {
    const { data: roomRows, error: roomQueryError } = await supabase
      .from("rooms")
      .select("id, type")
      .eq("is_available", true);

    if (roomQueryError) {
      return { error: t.saveBookingError, success: null };
    }

    const roomsInCategory = ((roomRows ?? []) as RoomLookupRow[]).filter(
      (room) => getRoomCategory(room.type) === roomCategory
    );

    selectedRoomId = await findFirstAvailableRoomId(
      supabase,
      roomsInCategory,
      startDate,
      endDate
    );
  }

  if (!selectedRoomId) {
    if (roomCategory) {
      return { error: t.roomNotAvailable, success: null };
    }
    return { error: t.invalidRoomSelection, success: null };
  }

  // Check availability using the updated RPC function
  const { data: isAvailable, error: availabilityError } = await supabase.rpc('is_room_available', {
    room_id_param: selectedRoomId,
    start_date_param: startDate,
    end_date_param: endDate
  });

  if (!availabilityError && isAvailable === false) {
    return { error: t.roomNotAvailable, success: null };
  }

  const { error } = await supabase.from("bookings").insert({
    user_id: user.id,
    room_id: selectedRoomId,
    start_date: startDate,
    end_date: endDate,
    status: "pending", // Always start as pending
  });

  if (error) {
    if (error.code === "23P01") {
      return { error: t.roomNotAvailable, success: null };
    }
    return { error: t.saveBookingError, success: null };
  }

  await sendBookingEmail({
    endDate,
    event: "created",
    locale,
    roomId: selectedRoomId,
    startDate,
    toEmail: user.email,
  });

  revalidatePath("/bookings");
  return { error: null, success: t.bookingCreated };
}

async function findFirstAvailableRoomId(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  roomsInCategory: RoomLookupRow[],
  startDate: string,
  endDate: string
) {
  for (const room of roomsInCategory) {
    const { data: isAvailable, error } = await supabase.rpc("is_room_available", {
      room_id_param: room.id,
      start_date_param: startDate,
      end_date_param: endDate,
    });

    if (!error && isAvailable) {
      return room.id;
    }
  }

  return null;
}

/** Finalizes a PENDING booking */
export async function confirmBooking(
  _previousState: BookingMutationActionState,
  formData: FormData
): Promise<BookingMutationActionState> {
  const locale = await getServerLocale();
  const t = translations[locale].actions;
  const bookingId = getBookingIdFromFormData(formData);
  if (!bookingId) {
    return { error: t.invalidBookingId, success: null };
  }

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .select("id, status, user_id, room_id, start_date, end_date")
    .eq("id", bookingId)
    .maybeSingle();

  if (bookingError) {
    return { error: t.findBookingError, success: null };
  }
  if (!booking) {
    return { error: t.bookingNotFound, success: null };
  }

  const typedBooking = booking as BookingMutationRow;
  if (typedBooking.user_id !== user.id) {
    return { error: t.notAllowedUpdate, success: null };
  }

  if (typedBooking.status === "confirmed") {
    revalidatePath("/bookings");
    return { error: null, success: t.bookingAlreadyConfirmed };
  }

  const { error: updateError } = await supabase
    .from("bookings")
    .update({ status: "confirmed" })
    .eq("id", bookingId);

  if (updateError) {
    if (updateError.code === "42501") {
      return { error: t.bookingUpdateBlockedPermissions, success: null };
    }
    if (updateError.code === "23P01") {
      return { error: t.roomNotAvailable, success: null };
    }
    return { error: t.confirmWriteError, success: null };
  }

  const { data: verifyRow, error: verifyError } = await supabase
    .from("bookings")
    .select("status")
    .eq("id", bookingId)
    .maybeSingle();

  if (verifyError) {
    return { error: t.confirmVerifyError, success: null };
  }
  if (!verifyRow || verifyRow.status !== "confirmed") {
    return { error: t.bookingUpdateBlockedPermissions, success: null };
  }

  await sendBookingEmail({
    endDate: typedBooking.end_date,
    event: "confirmed",
    locale,
    roomId: typedBooking.room_id,
    startDate: typedBooking.start_date,
    toEmail: user.email,
  });

  revalidatePath("/bookings");
  return { error: null, success: t.bookingConfirmed };
}

/** Removes/Cancels a booking */
export async function deleteBooking(
  _previousState: BookingMutationActionState,
  formData: FormData
): Promise<BookingMutationActionState> {
  const locale = await getServerLocale();
  const t = translations[locale].actions;
  const bookingId = getBookingIdFromFormData(formData);
  if (!bookingId) {
    return { error: t.invalidBookingId, success: null };
  }

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .select("id, status, user_id, room_id, start_date, end_date")
    .eq("id", bookingId)
    .maybeSingle();

  if (bookingError) {
    return { error: t.findBookingError, success: null };
  }
  if (!booking) {
    return { error: t.bookingNotFound, success: null };
  }

  const typedBooking = booking as BookingMutationRow;
  if (typedBooking.user_id !== user.id) {
    return { error: t.notAllowedDelete, success: null };
  }

  const { error: deleteError } = await supabase
    .from("bookings")
    .delete()
    .eq("id", bookingId);

  if (deleteError) {
    if (deleteError.code === "42501") {
      return { error: t.bookingRemovalBlockedPermissions, success: null };
    }
    return { error: t.deleteWriteError, success: null };
  }

  const { data: verifyRow, error: verifyError } = await supabase
    .from("bookings")
    .select("id")
    .eq("id", bookingId)
    .maybeSingle();

  if (verifyError) {
    return { error: t.deleteVerifyError, success: null };
  }
  if (verifyRow) {
    return { error: t.bookingRemovalBlockedPermissions, success: null };
  }

  await sendBookingEmail({
    endDate: typedBooking.end_date,
    event: "cancelled",
    locale,
    roomId: typedBooking.room_id,
    startDate: typedBooking.start_date,
    toEmail: user.email,
  });

  revalidatePath("/bookings");
  return { error: null, success: t.bookingRemoved };
}
