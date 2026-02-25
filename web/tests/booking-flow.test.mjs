import assert from "node:assert/strict";
import test from "node:test";
import { createClient } from "@supabase/supabase-js";

const REQUIRED_ENV = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "E2E_EMAIL",
  "E2E_PASSWORD",
  "E2E_ROOM_ID",
];

const SECONDARY_ENV = ["E2E_SECOND_EMAIL", "E2E_SECOND_PASSWORD"];

const missingRequired = REQUIRED_ENV.filter((name) => !process.env[name]);
const missingSecondary = SECONDARY_ENV.filter((name) => !process.env[name]);

function createAnonClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

function addDays(baseDate, daysToAdd) {
  const date = new Date(baseDate);
  date.setUTCDate(date.getUTCDate() + daysToAdd);
  return date.toISOString().slice(0, 10);
}

async function signIn(client, email, password) {
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  assert.equal(error, null, error?.message);
  assert.ok(data.user, "Expected signed-in user.");
  return data.user;
}

test(
  "booking flow enforces overlap check and allows confirm/delete for owner",
  { skip: missingRequired.length > 0 ? `Missing env vars: ${missingRequired.join(", ")}` : false },
  async () => {
    const client = createAnonClient();
    const roomId = process.env.E2E_ROOM_ID;
    const owner = await signIn(client, process.env.E2E_EMAIL, process.env.E2E_PASSWORD);
    const bookingSeedOffset = 120 + (Math.floor(Date.now() / 1000) % 80);
    const startDate = addDays(new Date(), bookingSeedOffset);
    const endDate = addDays(new Date(), bookingSeedOffset + 1);
    let bookingId = null;

    await client
      .from("bookings")
      .delete()
      .eq("user_id", owner.id)
      .eq("room_id", roomId)
      .eq("start_date", startDate);

    try {
      const { data: created, error: createError } = await client
        .from("bookings")
        .insert({
          end_date: endDate,
          room_id: roomId,
          start_date: startDate,
          status: "pending",
          user_id: owner.id,
        })
        .select("id, status")
        .single();

      assert.equal(createError, null, createError?.message);
      assert.ok(created?.id, "Expected booking id on create.");
      assert.equal(created?.status, "pending");
      bookingId = created.id;

      const { error: overlapError } = await client.from("bookings").insert({
        end_date: endDate,
        room_id: roomId,
        start_date: startDate,
        status: "pending",
        user_id: owner.id,
      });

      assert.ok(overlapError, "Expected overlapping booking insert to fail.");

      const { data: confirmed, error: confirmError } = await client
        .from("bookings")
        .update({ status: "confirmed" })
        .eq("id", bookingId)
        .select("id, status")
        .single();

      assert.equal(confirmError, null, confirmError?.message);
      assert.equal(confirmed?.status, "confirmed");

      const { error: removeError } = await client.from("bookings").delete().eq("id", bookingId);
      assert.equal(removeError, null, removeError?.message);
      bookingId = null;
    } finally {
      if (bookingId) {
        await client.from("bookings").delete().eq("id", bookingId);
      }
      await client.auth.signOut();
    }
  }
);

test(
  "RLS blocks booking updates and deletes across users",
  {
    skip:
      missingRequired.length > 0 || missingSecondary.length > 0
        ? `Missing env vars: ${[...missingRequired, ...missingSecondary].join(", ")}`
        : false,
  },
  async () => {
    const ownerClient = createAnonClient();
    const secondaryClient = createAnonClient();
    const roomId = process.env.E2E_ROOM_ID;

    const owner = await signIn(ownerClient, process.env.E2E_EMAIL, process.env.E2E_PASSWORD);
    await signIn(secondaryClient, process.env.E2E_SECOND_EMAIL, process.env.E2E_SECOND_PASSWORD);

    const bookingSeedOffset = 220 + (Math.floor(Date.now() / 1000) % 80);
    const startDate = addDays(new Date(), bookingSeedOffset);
    const endDate = addDays(new Date(), bookingSeedOffset + 1);
    let bookingId = null;

    await ownerClient
      .from("bookings")
      .delete()
      .eq("user_id", owner.id)
      .eq("room_id", roomId)
      .eq("start_date", startDate);

    try {
      const { data: created, error: createError } = await ownerClient
        .from("bookings")
        .insert({
          end_date: endDate,
          room_id: roomId,
          start_date: startDate,
          status: "pending",
          user_id: owner.id,
        })
        .select("id")
        .single();

      assert.equal(createError, null, createError?.message);
      assert.ok(created?.id, "Expected booking id on create.");
      bookingId = created.id;

      const { error: crossUpdateError } = await secondaryClient
        .from("bookings")
        .update({ status: "confirmed" })
        .eq("id", bookingId);

      assert.ok(crossUpdateError, "Expected cross-user booking update to fail.");

      const { error: crossDeleteError } = await secondaryClient
        .from("bookings")
        .delete()
        .eq("id", bookingId);

      assert.ok(crossDeleteError, "Expected cross-user booking delete to fail.");
    } finally {
      if (bookingId) {
        await ownerClient.from("bookings").delete().eq("id", bookingId);
      }
      await ownerClient.auth.signOut();
      await secondaryClient.auth.signOut();
    }
  }
);
