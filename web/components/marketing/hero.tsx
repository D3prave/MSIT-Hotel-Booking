"use client";

import { useMemo, useState } from "react";
import { siteConfig } from "@/config/site-config";

function toISODate(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function Hero() {
  const today = useMemo(() => new Date(), []);
  const tomorrow = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d;
  }, []);

  const [checkIn, setCheckIn] = useState<string>(toISODate(today));
  const [checkOut, setCheckOut] = useState<string>(toISODate(tomorrow));
  const [result, setResult] = useState<string | null>(null);

  function onCheckAvailability() {
    if (!checkIn || !checkOut) {
      setResult("Please select both dates.");
      return;
    }
    if (checkOut <= checkIn) {
      setResult("Check-out must be after check-in.");
      return;
    }
    setResult("Mock OK — next step: query Supabase for room availability.");
  }

  return (
    <section className="mx-auto grid max-w-6xl gap-8 px-4 py-14 md:grid-cols-2 md:items-center">
      <div>
        <p className="text-sm text-white/70">{siteConfig.description}</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
          {siteConfig.hero.headline}
        </h1>
        <p className="mt-4 text-base text-white/80">
          {siteConfig.hero.subheadline}
        </p>

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="grid gap-3 sm:grid-cols-3 sm:items-end">
            <label className="grid gap-1">
              <span className="text-xs text-white/70">Check-in</span>
              <input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none"
              />
            </label>

            <label className="grid gap-1">
              <span className="text-xs text-white/70">Check-out</span>
              <input
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none"
              />
            </label>

            <button
              onClick={onCheckAvailability}
              className="rounded-xl bg-white px-4 py-2 text-sm text-black hover:opacity-90"
            >
              Check Availability
            </button>
          </div>

          {result && (
            <p className="mt-3 text-sm text-white/80" aria-live="polite">
              {result}
            </p>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={siteConfig.hero.imageUrl}
          alt="Hotel placeholder"
          className="h-full w-full object-cover"
        />
      </div>
    </section>
  );
}