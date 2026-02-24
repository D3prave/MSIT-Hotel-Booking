"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  confirmBooking,
  deleteBooking,
  type BookingMutationActionState,
} from "@/app/actions/booking";

type BookingActionsProps = {
  bookingId: string;
  status: string;
};

const initialState: BookingMutationActionState = { error: null };

type SubmitActionButtonProps = {
  className: string;
  idleLabel: string;
  pendingLabel: string;
};

function SubmitActionButton({ className, idleLabel, pendingLabel }: SubmitActionButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={`${className} disabled:cursor-not-allowed disabled:opacity-60`}
    >
      {pending ? pendingLabel : idleLabel}
    </button>
  );
}

export default function BookingActions({ bookingId, status }: BookingActionsProps) {
  const isPending = status === "pending";
  const [confirmState, confirmAction] = useActionState(confirmBooking, initialState);
  const [deleteState, deleteAction] = useActionState(deleteBooking, initialState);
  const actionError = confirmState.error ?? deleteState.error;

  return (
    <div className="mt-6 md:mt-0 space-y-2">
      <div className="flex gap-4">
        {isPending && (
          <form action={confirmAction}>
            <input type="hidden" name="bookingId" value={bookingId} />
            <SubmitActionButton
              className="px-6 py-3 rounded-xl bg-green-600 text-white text-xs font-bold uppercase hover:bg-green-500 transition-all"
              idleLabel="Confirm"
              pendingLabel="Confirming..."
            />
          </form>
        )}

        <form action={deleteAction}>
          <input type="hidden" name="bookingId" value={bookingId} />
          <SubmitActionButton
            className="px-6 py-3 rounded-xl border border-red-500/50 text-red-500 text-xs font-bold uppercase hover:bg-red-500 hover:text-white transition-all"
            idleLabel={isPending ? "Remove" : "Cancel"}
            pendingLabel={isPending ? "Removing..." : "Cancelling..."}
          />
        </form>
      </div>

      <p
        aria-live="polite"
        className={`min-h-5 text-xs font-semibold ${
          actionError ? "text-red-400" : "text-transparent"
        }`}
      >
        {actionError ?? " "}
      </p>
    </div>
  );
}
