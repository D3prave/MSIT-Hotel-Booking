-- 06_fixed_60pct_seed_ignoring_new_bookings.sql
-- Run in Supabase SQL Editor (production/server).
-- Behavior:
-- - Creates a fixed baseline occupancy of 60% (15 of 25 ACTIVE rooms) for the next 180 days.
-- - Attic suite is always excluded from baseline and kept available.
-- - New user bookings are NOT used to compute the 60% baseline.
-- - Optional hard-enforce mode can cancel conflicting user bookings on seed rooms.

alter table public.bookings
  add column if not exists is_seed boolean not null default false;

create index if not exists idx_bookings_is_seed_dates
  on public.bookings (is_seed, start_date, end_date);

do $$
declare
  horizon_start date := current_date + 1;
  horizon_end date := current_date + 181; -- exclusive (180 nights)
  seed_user uuid;
  active_rooms integer;
begin
  -- Need one auth user id as owner for system seed bookings.
  select id into seed_user
  from auth.users
  order by created_at nulls last
  limit 1;

  if seed_user is null then
    raise exception 'No auth.users row found. Create at least one user, then re-run.';
  end if;

  -- Ensure attic stays free.
  update public.bookings b
  set status = 'cancelled'
  from public.rooms r
  where b.room_id = r.id
    and lower(r.type) like '%attic%'
    and b.status in ('pending', 'confirmed')
    and b.end_date > current_date;

  -- Remove old future seed bookings before recreating baseline.
  delete from public.bookings
  where is_seed = true
    and end_date > current_date;

  -- Pick exactly 15 baseline rooms from ACTIVE non-attic inventory.
  create temporary table seed_rooms on commit drop as
  select r.id
  from public.rooms r
  where r.is_available = true
    and lower(r.type) not like '%attic%'
  order by r.type, r.id
  limit 15;

  select count(*) into active_rooms
  from seed_rooms;

  if active_rooms <> 15 then
    raise exception 'Expected 15 non-attic active rooms for baseline, found %.', active_rooms;
  end if;

  -- OPTIONAL HARD ENFORCE:
  -- Uncomment this block if you want EXACT 60% every night, even if it cancels real user bookings
  -- on the seeded rooms.
  /*
  update public.bookings b
  set status = 'cancelled'
  where b.room_id in (select id from seed_rooms)
    and b.status in ('pending', 'confirmed')
    and b.end_date > current_date;
  */

  -- Create seed bookings day-by-day for each seeded room.
  -- If hard-enforce block is disabled, conflicts are skipped.
  insert into public.bookings (user_id, room_id, start_date, end_date, status, is_seed)
  select
    seed_user,
    sr.id,
    d::date as start_date,
    (d + interval '1 day')::date as end_date,
    'confirmed' as status,
    true as is_seed
  from seed_rooms sr
  cross join generate_series(horizon_start::timestamp, (horizon_end - 1)::timestamp, interval '1 day') d
  where not exists (
    select 1
    from public.bookings b
    where b.room_id = sr.id
      and b.status in ('pending', 'confirmed')
      and daterange(b.start_date, b.end_date, '[)') &&
          daterange(d::date, (d + interval '1 day')::date, '[)')
  );
end
$$;

-- Check daily occupancy for next 30 nights (total occupancy, includes user bookings).
with days as (
  select (current_date + offs)::date as day
  from generate_series(1, 30) as offs
),
active_total as (
  select count(*)::numeric as total_rooms
  from public.rooms
  where is_available = true
),
occ as (
  select
    d.day,
    count(distinct b.room_id) as occupied_rooms
  from days d
  left join public.bookings b
    on b.status in ('pending', 'confirmed')
   and daterange(b.start_date, b.end_date, '[)') &&
       daterange(d.day, d.day + 1, '[)')
  group by d.day
)
select
  o.day,
  o.occupied_rooms,
  round((o.occupied_rooms::numeric / nullif(a.total_rooms, 0)) * 100, 1) as occupancy_pct
from occ o
cross join active_total a
order by o.day;

-- Attic availability check (next 30 nights).
with attic as (
  select id
  from public.rooms
  where is_available = true
    and lower(type) like '%attic%'
  limit 1
),
days as (
  select (current_date + offs)::date as day
  from generate_series(1, 30) as offs
)
select
  d.day,
  public.is_room_available(a.id, d.day, d.day + 1) as attic_available
from days d
cross join attic a
order by d.day;
