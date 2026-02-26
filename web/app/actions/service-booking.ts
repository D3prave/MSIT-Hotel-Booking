"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerLocale } from "@/lib/i18n/server";
import { translations } from "@/lib/i18n/translations";
import { sendServiceBookingEmail } from "@/lib/notifications/email";

const ALLOWED_SERVICE_CODES = new Set([
  "stretch_think_workshop",
  "infused_drink_tasting",
  "conference_room_rental",
  "wellness_addons",
  "scenic_drive_picnic",
  "local_culinary_experience",
]);

export type CreateServiceBookingActionState = {
  error: string | null;
  success: string | null;
};

export type ServiceBookingMutationActionState = {
  error: string | null;
  success: string | null;
};

type ServiceBookingRow = {
  id: string;
  participants: number;
  service_code: string;
  service_date: string;
  service_title: string;
  status: string;
  total_price_cents: number;
  unit_price_cents: number;
  user_id: string;
};

function getTodayLocalDateString() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today.toISOString().slice(0, 10);
}

function getServiceBookingIdFromFormData(formData: FormData): string | null {
  const value = formData.get("serviceBookingId");
  if (typeof value !== "string" || value.trim().length === 0) return null;
  return value.trim();
}

export async function createServiceBooking(
  _previousState: CreateServiceBookingActionState,
  formData: FormData
): Promise<CreateServiceBookingActionState> {
  const locale = await getServerLocale();
  const t = translations[locale].actions;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const serviceCodeValue = formData.get("serviceCode");
  const serviceTitleValue = formData.get("serviceTitle");
  const serviceDateValue = formData.get("serviceDate");
  const participantsValue = formData.get("participants");
  const unitPriceValue = formData.get("unitPriceCents");
  const pricingModelValue = formData.get("pricingModel");

  if (typeof serviceCodeValue !== "string" || !ALLOWED_SERVICE_CODES.has(serviceCodeValue)) {
    return { error: t.invalidServiceSelection, success: null };
  }
  if (typeof serviceTitleValue !== "string" || serviceTitleValue.trim().length === 0) {
    return { error: t.invalidServiceSelection, success: null };
  }
  if (typeof serviceDateValue !== "string" || serviceDateValue.trim().length === 0) {
    return { error: t.invalidServiceDate, success: null };
  }

  const participants = Number.parseInt(String(participantsValue ?? "1"), 10);
  const unitPriceCents = Number.parseInt(String(unitPriceValue ?? "0"), 10);
  const perPerson = String(pricingModelValue ?? "").trim() === "per_person";

  if (!Number.isFinite(participants) || participants < 1 || participants > 20) {
    return { error: t.invalidServiceParticipants, success: null };
  }
  if (!Number.isFinite(unitPriceCents) || unitPriceCents < 0) {
    return { error: t.invalidServiceSelection, success: null };
  }

  const serviceDate = serviceDateValue.trim();
  if (serviceDate < getTodayLocalDateString()) {
    return { error: t.invalidServiceDate, success: null };
  }

  const totalPriceCents = perPerson ? unitPriceCents * participants : unitPriceCents;

  const { error } = await supabase.from("service_bookings").insert({
    participants,
    service_code: serviceCodeValue,
    service_date: serviceDate,
    service_title: serviceTitleValue.trim(),
    status: "pending",
    total_price_cents: totalPriceCents,
    unit_price_cents: unitPriceCents,
    user_id: user.id,
  });

  if (error) {
    if (error.code === "42P01") {
      return { error: t.serviceBookingsTableMissing, success: null };
    }
    if (error.code === "42501") {
      return { error: t.serviceBookingInsertBlockedPermissions, success: null };
    }
    return { error: t.serviceBookingSaveError, success: null };
  }

  await sendServiceBookingEmail({
    event: "created",
    locale,
    participants,
    serviceDate,
    serviceTitle: serviceTitleValue.trim(),
    toEmail: user.email,
    totalPriceCents,
  });

  revalidatePath("/bookings");
  return { error: null, success: t.serviceBookingCreated };
}

export async function confirmServiceBooking(
  _previousState: ServiceBookingMutationActionState,
  formData: FormData
): Promise<ServiceBookingMutationActionState> {
  const locale = await getServerLocale();
  const t = translations[locale].actions;
  const serviceBookingId = getServiceBookingIdFromFormData(formData);
  if (!serviceBookingId) {
    return { error: t.invalidServiceBookingId, success: null };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: row, error: fetchError } = await supabase
    .from("service_bookings")
    .select(
      "id, user_id, service_code, service_title, service_date, participants, unit_price_cents, total_price_cents, status"
    )
    .eq("id", serviceBookingId)
    .maybeSingle();

  if (fetchError) {
    if (fetchError.code === "42P01") {
      return { error: t.serviceBookingsTableMissing, success: null };
    }
    return { error: t.findServiceBookingError, success: null };
  }
  if (!row) {
    return { error: t.serviceBookingNotFound, success: null };
  }

  const serviceBooking = row as ServiceBookingRow;
  if (serviceBooking.user_id !== user.id) {
    return { error: t.notAllowedServiceUpdate, success: null };
  }

  if (serviceBooking.status === "confirmed") {
    revalidatePath("/bookings");
    return { error: null, success: t.serviceBookingAlreadyConfirmed };
  }

  const { error: updateError } = await supabase
    .from("service_bookings")
    .update({ status: "confirmed" })
    .eq("id", serviceBookingId);

  if (updateError) {
    if (updateError.code === "42501") {
      return { error: t.serviceBookingUpdateBlockedPermissions, success: null };
    }
    return { error: t.serviceConfirmWriteError, success: null };
  }

  await sendServiceBookingEmail({
    event: "confirmed",
    locale,
    participants: serviceBooking.participants,
    serviceDate: serviceBooking.service_date,
    serviceTitle: serviceBooking.service_title,
    toEmail: user.email,
    totalPriceCents: serviceBooking.total_price_cents,
  });

  revalidatePath("/bookings");
  return { error: null, success: t.serviceBookingConfirmed };
}

export async function deleteServiceBooking(
  _previousState: ServiceBookingMutationActionState,
  formData: FormData
): Promise<ServiceBookingMutationActionState> {
  const locale = await getServerLocale();
  const t = translations[locale].actions;
  const serviceBookingId = getServiceBookingIdFromFormData(formData);
  if (!serviceBookingId) {
    return { error: t.invalidServiceBookingId, success: null };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: row, error: fetchError } = await supabase
    .from("service_bookings")
    .select(
      "id, user_id, service_code, service_title, service_date, participants, unit_price_cents, total_price_cents, status"
    )
    .eq("id", serviceBookingId)
    .maybeSingle();

  if (fetchError) {
    if (fetchError.code === "42P01") {
      return { error: t.serviceBookingsTableMissing, success: null };
    }
    return { error: t.findServiceBookingError, success: null };
  }
  if (!row) {
    return { error: t.serviceBookingNotFound, success: null };
  }

  const serviceBooking = row as ServiceBookingRow;
  if (serviceBooking.user_id !== user.id) {
    return { error: t.notAllowedServiceDelete, success: null };
  }

  const { error: deleteError } = await supabase
    .from("service_bookings")
    .delete()
    .eq("id", serviceBookingId);

  if (deleteError) {
    if (deleteError.code === "42501") {
      return { error: t.serviceBookingDeleteBlockedPermissions, success: null };
    }
    return { error: t.serviceDeleteWriteError, success: null };
  }

  await sendServiceBookingEmail({
    event: "cancelled",
    locale,
    participants: serviceBooking.participants,
    serviceDate: serviceBooking.service_date,
    serviceTitle: serviceBooking.service_title,
    toEmail: user.email,
    totalPriceCents: serviceBooking.total_price_cents,
  });

  revalidatePath("/bookings");
  return { error: null, success: t.serviceBookingRemoved };
}
