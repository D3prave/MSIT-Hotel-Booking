"use client";

import { useActionState, useEffect, useRef } from "react";
import { createBooking, type CreateBookingActionState } from "@/app/actions/booking";
import {
  createRoomWaitlistEntry,
  type CreateRoomWaitlistActionState,
} from "@/app/actions/waitlist";
import { useLanguage } from "@/components/providers/language-provider";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/providers/toast-provider";

const initialState: CreateBookingActionState = { error: null, success: null };
const waitlistInitialState: CreateRoomWaitlistActionState = { error: null, success: null };

type BookRoomFormProps = {
  roomCategory?: string;
  roomId?: string;
  startDate: string;
  endDate: string;
  testId?: string;
  unavailable?: boolean;
  showWaitlist?: boolean;
};

export default function BookRoomForm({
  roomCategory,
  roomId,
  startDate,
  endDate,
  testId,
  unavailable = false,
  showWaitlist = false,
}: BookRoomFormProps) {
  const [state, formAction, isPending] = useActionState(createBooking, initialState);
  const [waitlistState, waitlistAction, isWaitlistPending] = useActionState(
    createRoomWaitlistEntry,
    waitlistInitialState
  );
  const { t } = useLanguage();
  const { addToast } = useToast();
  const router = useRouter();
  const lastErrorRef = useRef<string | null>(null);
  const lastSuccessRef = useRef<string | null>(null);
  const lastWaitlistErrorRef = useRef<string | null>(null);
  const lastWaitlistSuccessRef = useRef<string | null>(null);

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

  useEffect(() => {
    if (waitlistState.error && waitlistState.error !== lastWaitlistErrorRef.current) {
      lastWaitlistErrorRef.current = waitlistState.error;
      addToast(waitlistState.error, "error");
    }
  }, [addToast, waitlistState.error]);

  useEffect(() => {
    if (waitlistState.success && waitlistState.success !== lastWaitlistSuccessRef.current) {
      lastWaitlistSuccessRef.current = waitlistState.success;
      addToast(waitlistState.success, "success");
      router.push("/bookings");
      router.refresh();
    }
  }, [addToast, router, waitlistState.success]);

  return (
    <div className="space-y-1.5">
      <form action={formAction} className="space-y-0">
        {roomId ? <input type="hidden" name="roomId" value={roomId} /> : null}
        {roomCategory ? <input type="hidden" name="roomCategory" value={roomCategory} /> : null}
        <input type="hidden" name="startDate" value={startDate} />
        <input type="hidden" name="endDate" value={endDate} />

        <button
          type="submit"
          disabled={isPending || unavailable}
          data-testid={testId ?? "book-room-button"}
          className="w-full rounded-xl bg-[#3d2b1f] py-2.5 text-[11px] font-bold uppercase tracking-[0.14em] text-white transition-all hover:bg-opacity-80 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {unavailable ? t.roomForm.unavailable : isPending ? t.roomForm.checking : t.roomForm.bookRoom}
        </button>
      </form>

      {showWaitlist && roomCategory ? (
        <form action={waitlistAction}>
          <input type="hidden" name="roomCategory" value={roomCategory} />
          <input type="hidden" name="startDate" value={startDate} />
          <input type="hidden" name="endDate" value={endDate} />
          <button
            type="submit"
            disabled={isWaitlistPending}
            className="w-full rounded-xl border border-[#a87f5d]/50 bg-transparent py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#d9b48f] transition-all hover:border-[#d9b48f] hover:text-[#e5c7a8] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isWaitlistPending ? t.roomForm.joiningWaitlist : t.roomForm.joinWaitlist}
          </button>
        </form>
      ) : null}

      {state.error ? (
        <p aria-live="polite" className="mt-1 text-[11px] font-semibold text-red-400">
          {state.error}
        </p>
      ) : null}
    </div>
  );
}
