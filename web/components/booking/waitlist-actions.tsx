"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import {
  deleteRoomWaitlistEntry,
  type RoomWaitlistMutationActionState,
} from "@/app/actions/waitlist";
import { useLanguage } from "@/components/providers/language-provider";
import { useToast } from "@/components/providers/toast-provider";

type WaitlistActionsProps = {
  waitlistId: string;
};

const initialState: RoomWaitlistMutationActionState = { error: null, success: null };

function SubmitActionButton() {
  const { pending } = useFormStatus();
  const { t } = useLanguage();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-lg border border-red-500/50 px-5 py-2 text-[11px] font-bold uppercase text-red-500 transition-all hover:bg-red-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
    >
      {pending ? t.bookingActions.removing : t.bookingActions.remove}
    </button>
  );
}

export default function WaitlistActions({ waitlistId }: WaitlistActionsProps) {
  const [deleteState, deleteAction] = useActionState(deleteRoomWaitlistEntry, initialState);
  const { addToast } = useToast();
  const router = useRouter();
  const lastErrorRef = useRef<string | null>(null);
  const lastSuccessRef = useRef<string | null>(null);

  useEffect(() => {
    if (deleteState.error && deleteState.error !== lastErrorRef.current) {
      lastErrorRef.current = deleteState.error;
      addToast(deleteState.error, "error");
    }
  }, [addToast, deleteState.error]);

  useEffect(() => {
    if (deleteState.success && deleteState.success !== lastSuccessRef.current) {
      lastSuccessRef.current = deleteState.success;
      addToast(deleteState.success, "success");
      router.refresh();
    }
  }, [addToast, deleteState.success, router]);

  return (
    <form action={deleteAction}>
      <input type="hidden" name="waitlistId" value={waitlistId} />
      <SubmitActionButton />
    </form>
  );
}
