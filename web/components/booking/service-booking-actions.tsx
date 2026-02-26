"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import {
  confirmServiceBooking,
  deleteServiceBooking,
  type ServiceBookingMutationActionState,
} from "@/app/actions/service-booking";
import { useLanguage } from "@/components/providers/language-provider";
import { useToast } from "@/components/providers/toast-provider";

type ServiceBookingActionsProps = {
  serviceBookingId: string;
  status: string;
};

const initialState: ServiceBookingMutationActionState = { error: null, success: null };

type SubmitActionButtonProps = {
  className: string;
  idleLabel: string;
  pendingLabel: string;
  testId: string;
};

function SubmitActionButton({ className, idleLabel, pendingLabel, testId }: SubmitActionButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      data-testid={testId}
      className={`${className} disabled:cursor-not-allowed disabled:opacity-60`}
    >
      {pending ? pendingLabel : idleLabel}
    </button>
  );
}

export default function ServiceBookingActions({ serviceBookingId, status }: ServiceBookingActionsProps) {
  const isPending = status === "pending";
  const [confirmState, confirmAction] = useActionState(confirmServiceBooking, initialState);
  const [deleteState, deleteAction] = useActionState(deleteServiceBooking, initialState);
  const actionError = confirmState.error ?? deleteState.error;
  const actionSuccess = confirmState.success ?? deleteState.success;
  const { t } = useLanguage();
  const { addToast } = useToast();
  const router = useRouter();
  const lastErrorRef = useRef<string | null>(null);
  const lastSuccessRef = useRef<string | null>(null);

  useEffect(() => {
    if (actionError && actionError !== lastErrorRef.current) {
      lastErrorRef.current = actionError;
      addToast(actionError, "error");
    }
  }, [actionError, addToast]);

  useEffect(() => {
    if (actionSuccess && actionSuccess !== lastSuccessRef.current) {
      lastSuccessRef.current = actionSuccess;
      addToast(actionSuccess, "success");
      router.refresh();
    }
  }, [actionSuccess, addToast, router]);

  return (
    <div className="mt-4 w-full space-y-2 md:mt-0 md:w-auto">
      <div className="flex flex-col gap-2.5 sm:flex-row sm:gap-3">
        {isPending ? (
          <form action={confirmAction}>
            <input type="hidden" name="serviceBookingId" value={serviceBookingId} />
            <SubmitActionButton
              className="w-full rounded-lg bg-green-600 px-5 py-2 text-[11px] font-bold uppercase text-white transition-all hover:bg-green-500 sm:w-auto"
              idleLabel={t.bookingActions.confirm}
              pendingLabel={t.bookingActions.confirming}
              testId={`confirm-service-booking-${serviceBookingId}`}
            />
          </form>
        ) : null}

        <form action={deleteAction}>
          <input type="hidden" name="serviceBookingId" value={serviceBookingId} />
          <SubmitActionButton
            className="w-full rounded-lg border border-red-500/50 px-5 py-2 text-[11px] font-bold uppercase text-red-500 transition-all hover:bg-red-500 hover:text-white sm:w-auto"
            idleLabel={isPending ? t.bookingActions.remove : t.bookingActions.cancel}
            pendingLabel={isPending ? t.bookingActions.removing : t.bookingActions.cancelling}
            testId={`remove-service-booking-${serviceBookingId}`}
          />
        </form>
      </div>

      <p
        aria-live="polite"
        className={`min-h-5 text-xs font-semibold ${
          actionError ? "text-red-400" : actionSuccess ? "text-emerald-400" : "text-transparent"
        }`}
      >
        {actionError ?? actionSuccess ?? " "}
      </p>
    </div>
  );
}
