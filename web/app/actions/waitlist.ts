"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerLocale } from "@/lib/i18n/server";
import { isRoomCategory, translations } from "@/lib/i18n/translations";

export type CreateRoomWaitlistActionState = {
  error: string | null;
  success: string | null;
};

export type RoomWaitlistMutationActionState = {
  error: string | null;
  success: string | null;
};

type WaitlistRow = {
  id: string;
  user_id: string;
};

function getTodayLocalDateString() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today.toISOString().slice(0, 10);
}

function getWaitlistIdFromFormData(formData: FormData): string | null {
  const value = formData.get("waitlistId");
  if (typeof value !== "string" || value.trim().length === 0) return null;
  return value.trim();
}

export async function createRoomWaitlistEntry(
  _previousState: CreateRoomWaitlistActionState,
  formData: FormData
): Promise<CreateRoomWaitlistActionState> {
  const locale = await getServerLocale();
  const t = translations[locale].actions;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const roomCategoryValue = formData.get("roomCategory");
  const startDateValue = formData.get("startDate");
  const endDateValue = formData.get("endDate");

  if (
    typeof roomCategoryValue !== "string" ||
    !isRoomCategory(roomCategoryValue) ||
    typeof startDateValue !== "string" ||
    typeof endDateValue !== "string"
  ) {
    return { error: t.invalidWaitlistData, success: null };
  }

  const roomCategory = roomCategoryValue.trim();
  const startDate = startDateValue.trim();
  const endDate = endDateValue.trim();

  const today = getTodayLocalDateString();
  if (startDate < today || endDate <= startDate) {
    return { error: t.invalidWaitlistData, success: null };
  }

  const { data: existingEntry, error: existingError } = await supabase
    .from("room_waitlist")
    .select("id")
    .eq("user_id", user.id)
    .eq("room_category", roomCategory)
    .eq("start_date", startDate)
    .eq("end_date", endDate)
    .eq("status", "open")
    .maybeSingle();

  if (existingError && existingError.code !== "42P01") {
    return { error: t.waitlistSaveError, success: null };
  }

  if (existingEntry) {
    return { error: null, success: t.waitlistAlreadyExists };
  }

  const { error } = await supabase.from("room_waitlist").insert({
    end_date: endDate,
    room_category: roomCategory,
    start_date: startDate,
    status: "open",
    user_id: user.id,
    user_email: user.email ?? null,
  });

  if (error) {
    if (error.code === "42P01") {
      return { error: t.waitlistTableMissing, success: null };
    }
    if (error.code === "42501") {
      return { error: t.waitlistInsertBlockedPermissions, success: null };
    }
    if (error.code === "23505") {
      return { error: null, success: t.waitlistAlreadyExists };
    }
    return { error: t.waitlistSaveError, success: null };
  }

  revalidatePath("/");
  revalidatePath("/bookings");
  return { error: null, success: t.waitlistCreated };
}

export async function deleteRoomWaitlistEntry(
  _previousState: RoomWaitlistMutationActionState,
  formData: FormData
): Promise<RoomWaitlistMutationActionState> {
  const locale = await getServerLocale();
  const t = translations[locale].actions;
  const waitlistId = getWaitlistIdFromFormData(formData);
  if (!waitlistId) {
    return { error: t.invalidWaitlistId, success: null };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: row, error: fetchError } = await supabase
    .from("room_waitlist")
    .select("id, user_id")
    .eq("id", waitlistId)
    .maybeSingle();

  if (fetchError) {
    if (fetchError.code === "42P01") {
      return { error: t.waitlistTableMissing, success: null };
    }
    return { error: t.findWaitlistError, success: null };
  }

  if (!row) {
    return { error: t.waitlistNotFound, success: null };
  }

  const waitlistRow = row as WaitlistRow;
  if (waitlistRow.user_id !== user.id) {
    return { error: t.notAllowedWaitlistDelete, success: null };
  }

  const { error: deleteError } = await supabase
    .from("room_waitlist")
    .delete()
    .eq("id", waitlistId);

  if (deleteError) {
    if (deleteError.code === "42501") {
      return { error: t.waitlistDeleteBlockedPermissions, success: null };
    }
    return { error: t.waitlistDeleteError, success: null };
  }

  revalidatePath("/bookings");
  revalidatePath("/");
  return { error: null, success: t.waitlistRemoved };
}
