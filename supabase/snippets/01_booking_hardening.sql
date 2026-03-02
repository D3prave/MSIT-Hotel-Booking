-- 01_booking_hardening.sql
-- Run in Supabase SQL Editor (production/server).

-- Required for exclusion constraint with UUID equality.
create extension if not exists btree_gist;

-- Guard rail: bookings must have a valid date range.
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'bookings_valid_date_range'
  ) then
    alter table public.bookings
      add constraint bookings_valid_date_range
      check (start_date < end_date);
  end if;
end
$$;

-- Performance index for room/date overlap checks.
create index if not exists idx_bookings_room_dates_active
  on public.bookings (room_id, start_date, end_date)
  where status in ('pending', 'confirmed');

create index if not exists idx_bookings_user_created
  on public.bookings (user_id, created_at desc);

-- Resolve existing active overlaps before adding the exclusion constraint.
-- Strategy:
-- 1) Confirmed beats pending.
-- 2) For same status, oldest row wins.
-- 3) For same timestamp, lexicographically smaller id wins.
-- Losing rows are marked as cancelled.
do $$
declare
  cancelled_count integer;
begin
  loop
    with loser as (
      select b1.id
      from public.bookings b1
      join public.bookings b2
        on b1.room_id = b2.room_id
       and b1.id <> b2.id
       and b1.status in ('pending', 'confirmed')
       and b2.status in ('pending', 'confirmed')
       and daterange(b1.start_date, b1.end_date, '[)') &&
           daterange(b2.start_date, b2.end_date, '[)')
       and (
         (b1.status = 'pending' and b2.status = 'confirmed')
         or (
           b1.status = b2.status
           and (
             coalesce(b1.created_at, 'epoch'::timestamptz),
             b1.id::text
           ) > (
             coalesce(b2.created_at, 'epoch'::timestamptz),
             b2.id::text
           )
         )
       )
      order by b1.room_id, b1.start_date, b1.end_date
      limit 1
    )
    update public.bookings b
    set status = 'cancelled'
    where b.id in (select id from loser);

    get diagnostics cancelled_count = row_count;
    exit when cancelled_count = 0;
  end loop;
end
$$;

-- Hard guarantee against double-booking for active bookings.
-- If this fails, run the overlap finder from 04_verification.sql.
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'bookings_no_overlap_active'
  ) then
    alter table public.bookings
      add constraint bookings_no_overlap_active
      exclude using gist (
        room_id with =,
        daterange(start_date, end_date, '[)') with &&
      )
      where (status in ('pending', 'confirmed'));
  end if;
end
$$;

-- Availability helper used by the app.
create or replace function public.is_room_available(
  room_id_param uuid,
  start_date_param date,
  end_date_param date
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select not exists (
    select 1
    from public.bookings b
    where b.room_id = room_id_param
      and b.status in ('pending', 'confirmed')
      and daterange(b.start_date, b.end_date, '[)') &&
          daterange(start_date_param, end_date_param, '[)')
  );
$$;

revoke all on function public.is_room_available(uuid, date, date) from public;
grant execute on function public.is_room_available(uuid, date, date) to anon, authenticated;
