"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { getServerLocale } from "@/lib/i18n/server";
import { translations } from "@/lib/i18n/translations";
import { revalidatePath } from "next/cache";

export type CreateFeedbackActionState = {
  error: string | null;
  success: string | null;
};

const MAX_FEEDBACK_LENGTH = 1200;
const MIN_NAME_LENGTH = 2;
const MAX_NAME_LENGTH = 120;

export async function createFeedback(
  _previousState: CreateFeedbackActionState,
  formData: FormData
): Promise<CreateFeedbackActionState> {
  const locale = await getServerLocale();
  const t = translations[locale].actions;

  const nameValue = formData.get("name");
  const commentValue = formData.get("comment");
  if (typeof nameValue !== "string") {
    return { error: t.invalidFeedbackName, success: null };
  }
  if (typeof commentValue !== "string") {
    return { error: t.invalidFeedbackMessage, success: null };
  }

  const name = nameValue.trim();
  const comment = commentValue.trim();
  if (name.length < MIN_NAME_LENGTH || name.length > MAX_NAME_LENGTH) {
    return { error: t.invalidFeedbackName, success: null };
  }
  if (comment.length === 0 || comment.length > MAX_FEEDBACK_LENGTH) {
    return { error: t.invalidFeedbackMessage, success: null };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("guest_feedback").insert({
    comment,
    guest_name: name,
    locale,
    source: "website",
    user_email: user?.email ?? null,
    user_id: user?.id ?? null,
  });

  if (error) {
    if (error.code === "42P01") {
      return { error: t.feedbackTableMissing, success: null };
    }
    if (error.code === "42501") {
      return { error: t.feedbackInsertBlockedPermissions, success: null };
    }
    return { error: t.feedbackSaveError, success: null };
  }

  revalidatePath("/");
  return { error: null, success: t.feedbackSaved };
}
