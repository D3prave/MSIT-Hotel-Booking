"use client";

import { useActionState } from "react";
import { createBooking, type CreateBookingActionState } from "@/app/actions/booking";

const initialState: CreateBookingActionState = { error: null };

type BookRoomFormProps = {
  roomId: string;
  startDate: string;
  endDate: string;
};

export default function BookRoomForm({ roomId, startDate, endDate }: BookRoomFormProps) {
  const [state, formAction, isPending] = useActionState(createBooking, initialState);

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="roomId" value={roomId} />
      <input type="hidden" name="startDate" value={startDate} />
      <input type="hidden" name="endDate" value={endDate} />

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-xl bg-[#3d2b1f] py-3.5 text-xs font-bold uppercase tracking-widest text-white transition-all hover:bg-opacity-80 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Checking..." : "Book Room"}
      </button>

      {state.error && (
        <p aria-live="polite" className="text-xs font-semibold text-red-400">
          {state.error}
        </p>
      )}
    </form>
  );
}
