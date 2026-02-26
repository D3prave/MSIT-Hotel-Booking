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

type FeedbackInsertPayload = {
  comment: string;
  guest_name?: string;
  locale: string;
  source: string;
  user_email: string | null;
  user_id: string | null;
};

async function insertFeedback(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  payload: FeedbackInsertPayload
) {
  const { error } = await supabase.from("guest_feedback").insert(payload);
  return error;
}

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

  let payload: FeedbackInsertPayload = {
    comment,
    guest_name: name,
    locale,
    source: "website",
    user_email: user?.email ?? null,
    user_id: user?.id ?? null,
  };

  let error = await insertFeedback(supabase, payload);

  // Backward compatibility: older DB schema might not have guest_name yet.
  if (error?.code === "42703" && String(error.message ?? "").includes("guest_name")) {
    const { guest_name: _omit, ...legacyPayload } = payload;
    payload = legacyPayload;
    error = await insertFeedback(supabase, payload);
  }

  // Backward compatibility: older DB schema may still require min 12 chars.
  if (error?.code === "23514" && comment.length < 12) {
    error = await insertFeedback(supabase, {
      ...payload,
      comment: comment.padEnd(12, "."),
    });
  }

  if (error) {
    if (error.code === "42P01") {
      return { error: t.feedbackTableMissing, success: null };
    }
    if (error.code === "42501") {
      return { error: t.feedbackInsertBlockedPermissions, success: null };
    }
    if (error.code === "23514") {
      return { error: t.invalidFeedbackMessage, success: null };
    }
    return { error: t.feedbackSaveError, success: null };
  }

  revalidatePath("/");
  return { error: null, success: t.feedbackSaved };
}
