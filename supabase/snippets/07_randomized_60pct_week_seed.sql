-- 07_randomized_60pct_week_seed.sql
-- Run in Supabase SQL Editor.
-- Purpose:
-- - Day 1 = today in admin view, with randomized occupancy for the next 7 days.
-- - Keeps attic suite available.
-- - Random target per day around 60% of ACTIVE rooms (default 56%..64%).
--
-- IMPORTANT:
-- - hard_enforce = true will cancel overlapping active bookings in the 7-day window
--   on selected seeded rooms to keep the seeded plan stable.

alter table public.bookings
  add column if not exists is_seed boolean not null default false;

create index if not exists idx_bookings_is_seed_dates
  on public.bookings (is_seed, start_date, end_date);

do $$
declare
  horizon_start date := current_date;
  horizon_end date := current_date + 7; -- exclusive
  min_pct numeric := 0.56;
  max_pct numeric := 0.64;
  hard_enforce boolean := true;

  preferred_admin_email text := 'admin@example.com';
  seed_user uuid;

  total_active_rooms integer;
  non_attic_active_rooms integer;

  d date;
  target integer;
begin
  select id into seed_user
  from auth.users
  where lower(email) = lower(preferred_admin_email)
  order by created_at desc nulls last
  limit 1;

  if seed_user is null then
    select id into seed_user
    from auth.users
    order by created_at nulls last
    limit 1;
  end if;

  if seed_user is null then
    raise exception 'No auth.users row found. Create a user first, then re-run.';
  end if;

  select count(*) into total_active_rooms
  from public.rooms
  where is_available = true;

  select count(*) into non_attic_active_rooms
  from public.rooms
  where is_available = true
    and lower(type) not like '%attic%';

  if total_active_rooms = 0 or non_attic_active_rooms = 0 then
    raise exception 'No active inventory found. Ensure rooms are available before seeding.';
  end if;

  -- Keep attic suite available for the whole 7-day horizon.
  update public.bookings b
  set status = 'cancelled'
  from public.rooms r
  where b.room_id = r.id
    and lower(r.type) like '%attic%'
    and b.status in ('pending', 'confirmed')
    and daterange(b.start_date, b.end_date, '[)') && daterange(horizon_start, horizon_end, '[)');

  -- Remove old seed bookings in the same horizon before recreating.
  delete from public.bookings
  where is_seed = true
    and daterange(start_date, end_date, '[)') && daterange(horizon_start, horizon_end, '[)');

  -- Optional strict mode for demo control.
  if hard_enforce then
    update public.bookings b
    set status = 'cancelled'
    from public.rooms r
    where b.room_id = r.id
      and r.is_available = true
      and lower(r.type) not like '%attic%'
      and b.status in ('pending', 'confirmed')
      and daterange(b.start_date, b.end_date, '[)') && daterange(horizon_start, horizon_end, '[)');
  end if;

  for d in
    select gs::date
    from generate_series(horizon_start::timestamp, (horizon_end - 1)::timestamp, interval '1 day') gs
  loop
    target := round(total_active_rooms * (min_pct + random() * (max_pct - min_pct)))::int;
    target := greatest(1, least(non_attic_active_rooms, target));

    if hard_enforce then
      with selected as (
        select r.id
        from public.rooms r
        where r.is_available = true
          and lower(r.type) not like '%attic%'
        order by random()
        limit target
      )
      insert into public.bookings (user_id, room_id, start_date, end_date, status, is_seed)
      select
        seed_user,
        s.id,
        d,
        d + 1,
        'confirmed',
        true
      from selected s;
    else
      with selected as (
        select r.id
        from public.rooms r
        where r.is_available = true
          and lower(r.type) not like '%attic%'
          and not exists (
            select 1
            from public.bookings b
            where b.room_id = r.id
              and b.status in ('pending', 'confirmed')
              and daterange(b.start_date, b.end_date, '[)') && daterange(d, d + 1, '[)')
          )
        order by random()
        limit target
      )
      insert into public.bookings (user_id, room_id, start_date, end_date, status, is_seed)
      select
        seed_user,
        s.id,
        d,
        d + 1,
        'confirmed',
        true
      from selected s;
    end if;
  end loop;
end
$$;

-- Verify occupancy for today + next 6 days.
with days as (
  select (current_date + offs)::date as day
  from generate_series(0, 6) offs
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
   and daterange(b.start_date, b.end_date, '[)') && daterange(d.day, d.day + 1, '[)')
  group by d.day
)
select
  o.day,
  o.occupied_rooms,
  a.total_rooms,
  round((o.occupied_rooms::numeric / nullif(a.total_rooms, 0)) * 100, 1) as occupancy_pct
from occ o
cross join active_total a
order by o.day;

-- Verify attic availability for today + next 6 days.
with attic as (
  select id
  from public.rooms
  where is_available = true
    and lower(type) like '%attic%'
  limit 1
),
days as (
  select (current_date + offs)::date as day
  from generate_series(0, 6) offs
)
select
  d.day,
  public.is_room_available(a.id, d.day, d.day + 1) as attic_available
from days d
cross join attic a
order by d.day;
