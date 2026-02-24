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
    <div className="mt-6 w-full space-y-2 md:mt-0 md:w-auto">
      <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
        {isPending && (
          <form action={confirmAction}>
            <input type="hidden" name="bookingId" value={bookingId} />
            <SubmitActionButton
              className="w-full rounded-xl bg-green-600 px-6 py-3 text-xs font-bold uppercase text-white transition-all hover:bg-green-500 sm:w-auto"
              idleLabel="Confirm"
              pendingLabel="Confirming..."
            />
          </form>
        )}

        <form action={deleteAction}>
          <input type="hidden" name="bookingId" value={bookingId} />
          <SubmitActionButton
            className="w-full rounded-xl border border-red-500/50 px-6 py-3 text-xs font-bold uppercase text-red-500 transition-all hover:bg-red-500 hover:text-white sm:w-auto"
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
