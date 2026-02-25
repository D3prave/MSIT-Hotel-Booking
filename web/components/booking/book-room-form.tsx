"use client";

import { useActionState, useEffect, useRef } from "react";
import { createBooking, type CreateBookingActionState } from "@/app/actions/booking";
import { useLanguage } from "@/components/providers/language-provider";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/providers/toast-provider";

const initialState: CreateBookingActionState = { error: null, success: null };

type BookRoomFormProps = {
  roomCategory?: string;
  roomId?: string;
  startDate: string;
  endDate: string;
  testId?: string;
  unavailable?: boolean;
};

export default function BookRoomForm({
  roomCategory,
  roomId,
  startDate,
  endDate,
  testId,
  unavailable = false,
}: BookRoomFormProps) {
  const [state, formAction, isPending] = useActionState(createBooking, initialState);
  const { t } = useLanguage();
  const { addToast } = useToast();
  const router = useRouter();
  const lastErrorRef = useRef<string | null>(null);
  const lastSuccessRef = useRef<string | null>(null);

  useEffect(() => {
    if (state.error && state.error !== lastErrorRef.current) {
      lastErrorRef.current = state.error;
      addToast(state.error, "error");
    }
  }, [addToast, state.error]);

  useEffect(() => {
    if (state.success && state.success !== lastSuccessRef.current) {
      lastSuccessRef.current = state.success;
      addToast(state.success, "success");
      router.push("/bookings");
      router.refresh();
    }
  }, [addToast, router, state.success]);

  return (
    <form action={formAction} className="space-y-1.5">
      {roomId ? <input type="hidden" name="roomId" value={roomId} /> : null}
      {roomCategory ? <input type="hidden" name="roomCategory" value={roomCategory} /> : null}
      <input type="hidden" name="startDate" value={startDate} />
      <input type="hidden" name="endDate" value={endDate} />

      <button
        type="submit"
        disabled={isPending || unavailable}
        data-testid={testId ?? "book-room-button"}
        className="w-full rounded-xl bg-[#3d2b1f] py-3.5 text-xs font-bold uppercase tracking-widest text-white transition-all hover:bg-opacity-80 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {unavailable ? t.roomForm.unavailable : isPending ? t.roomForm.checking : t.roomForm.bookRoom}
      </button>

      <p
        aria-live="polite"
        className={`min-h-4 text-[11px] font-semibold ${
          state.error ? "text-red-400" : "text-transparent"
        }`}
      >
        {state.error ?? " "}
      </p>
    </form>
  );
}
