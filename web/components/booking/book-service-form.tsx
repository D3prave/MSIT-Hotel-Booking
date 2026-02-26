"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import {
  createServiceBooking,
  type CreateServiceBookingActionState,
} from "@/app/actions/service-booking";
import { useLanguage } from "@/components/providers/language-provider";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/providers/toast-provider";

const initialState: CreateServiceBookingActionState = { error: null, success: null };

type BookServiceFormProps = {
  defaultDate: string;
  perPersonPricing: boolean;
  serviceCode: string;
  serviceTitle: string;
  unitPriceCents: number;
};

export default function BookServiceForm({
  defaultDate,
  perPersonPricing,
  serviceCode,
  serviceTitle,
  unitPriceCents,
}: BookServiceFormProps) {
  const [state, formAction, isPending] = useActionState(createServiceBooking, initialState);
  const [serviceDate, setServiceDate] = useState(defaultDate);
  const [participants, setParticipants] = useState(1);
  const { t } = useLanguage();
  const { addToast } = useToast();
  const router = useRouter();
  const lastErrorRef = useRef<string | null>(null);
  const lastSuccessRef = useRef<string | null>(null);

  useEffect(() => {
    setServiceDate(defaultDate);
  }, [defaultDate]);

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

  const totalLabel = useMemo(() => {
    const total = perPersonPricing ? unitPriceCents * participants : unitPriceCents;
    return `EUR ${(total / 100).toFixed(2)}`;
  }, [participants, perPersonPricing, unitPriceCents]);

  return (
    <form action={formAction} className="mt-3 space-y-2 rounded-lg border border-white/10 bg-[#0b1220]/40 p-2.5">
      <input type="hidden" name="serviceCode" value={serviceCode} />
      <input type="hidden" name="serviceTitle" value={serviceTitle} />
      <input type="hidden" name="unitPriceCents" value={String(unitPriceCents)} />
      <input type="hidden" name="pricingModel" value={perPersonPricing ? "per_person" : "fixed"} />

      <div className="grid grid-cols-2 gap-1.5">
        <label className="flex flex-col gap-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white/45">
          {t.serviceForm.dateLabel}
          <input
            type="date"
            name="serviceDate"
            min={defaultDate}
            value={serviceDate}
            onChange={(event) => setServiceDate(event.target.value)}
            className="date-input rounded-md border border-white/15 bg-[#0b1220]/70 px-2 py-1 text-[11px] text-white outline-none focus:border-[#a87f5d]"
          />
        </label>

        <label className="flex flex-col gap-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white/45">
          {t.serviceForm.participantsLabel}
          <input
            type="number"
            name="participants"
            min={1}
            max={20}
            value={participants}
            onChange={(event) => setParticipants(Math.max(1, Math.min(20, Number(event.target.value) || 1)))}
            className="rounded-md border border-white/15 bg-[#0b1220]/70 px-2 py-1 text-[11px] text-white outline-none focus:border-[#a87f5d]"
          />
        </label>
      </div>

      <p className="text-[10px] font-semibold text-white/55">
        {t.serviceForm.estimatedTotal}: <span className="text-[#0ea5e9]">{totalLabel}</span>
      </p>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-[#3d2b1f] py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-white transition-all hover:bg-[#513625] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? t.serviceForm.booking : t.serviceForm.book}
      </button>
    </form>
  );
}
