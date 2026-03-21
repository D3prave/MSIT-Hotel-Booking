-- 12_randomized_72pct_week_seed.sql
-- Run in Supabase SQL Editor.
--
-- Purpose:
-- - Rebuild the admin dashboard's 7-day occupancy window with non-flat demo data.
-- - Keeps average occupancy around 72% across active rooms.
-- - Uses random room selection plus 1-3 night stays, so category totals vary by day.
-- - Keeps the attic suite unseeded for a cleaner premium-availability story.
--
-- IMPORTANT:
-- - This is a demo reseed for the next 7 days (today + next 6).
-- - It cancels existing pending/confirmed bookings in that 7-day window for ACTIVE rooms.

alter table public.bookings
  add column if not exists is_seed boolean not null default false;

create index if not exists idx_bookings_is_seed_dates
  on public.bookings (is_seed, start_date, end_date);

do $$
declare
  horizon_start date := current_date;
  horizon_end date := current_date + 7; -- exclusive
  preferred_admin_email text := 'admin@example.com';
  seed_user uuid;

  total_active_rooms integer;
  non_attic_active_rooms integer;

  d date;
  dow integer;
  base_target integer;
  target integer;
  current_occupied integer;
  rooms_needed integer;
begin
  select id
  into seed_user
  from auth.users
  where lower(email) = lower(preferred_admin_email)
  order by created_at desc nulls last
  limit 1;

  if seed_user is null then
    select id
    into seed_user
    from auth.users
    order by created_at nulls last
    limit 1;
  end if;

  if seed_user is null then
    raise exception 'No auth.users row found. Create at least one user first, then re-run.';
  end if;

  select count(*)
  into total_active_rooms
  from public.rooms
  where is_available = true;

  select count(*)
  into non_attic_active_rooms
  from public.rooms
  where is_available = true
    and lower(type) not like '%attic%';

  if total_active_rooms = 0 or non_attic_active_rooms = 0 then
    raise exception 'No active inventory found. Ensure rooms are available before seeding.';
  end if;

  delete from public.bookings
  where is_seed = true
    and daterange(start_date, end_date, '[)') &&
        daterange(horizon_start, horizon_end, '[)');

  update public.bookings b
  set status = 'cancelled'
  from public.rooms r
  where b.room_id = r.id
    and r.is_available = true
    and b.status in ('pending', 'confirmed')
    and daterange(b.start_date, b.end_date, '[)') &&
        daterange(horizon_start, horizon_end, '[)');

  base_target := round((total_active_rooms * 0.72)::numeric)::int;

  for d in
    select gs::date
    from generate_series(horizon_start::timestamp, (horizon_end - 1)::timestamp, interval '1 day') gs
  loop
    dow := extract(dow from d)::int;

    target := base_target
      + case
          when dow between 1 and 4 then 1  -- Mon-Thu slightly stronger
          when dow = 5 then 0              -- Fri neutral
          when dow = 6 then -1             -- Sat lighter
          else -2                          -- Sun lightest
        end
      + floor(random() * 3)::int - 1;     -- extra day-to-day variation (-1, 0, +1)

    target := greatest(16, least(non_attic_active_rooms, target));

    select count(distinct b.room_id)
    into current_occupied
    from public.bookings b
    join public.rooms r
      on r.id = b.room_id
    where b.status in ('pending', 'confirmed')
      and r.is_available = true
      and lower(r.type) not like '%attic%'
      and daterange(b.start_date, b.end_date, '[)') &&
          daterange(d, d + 1, '[)');

    rooms_needed := greatest(0, target - current_occupied);

    if rooms_needed > 0 then
      insert into public.bookings (user_id, room_id, start_date, end_date, status, is_seed)
      select
        seed_user,
        c.room_id,
        d,
        c.booking_end,
        'confirmed',
        true
      from (
        select
          r.id as room_id,
          stay.booking_end
        from public.rooms r
        cross join lateral (
          select least(horizon_end, d + (1 + floor(random() * 3)::int))::date as booking_end
        ) stay
        where r.is_available = true
          and lower(r.type) not like '%attic%'
          and not exists (
            select 1
            from public.bookings b
            where b.room_id = r.id
              and b.status in ('pending', 'confirmed')
              and daterange(b.start_date, b.end_date, '[)') &&
                  daterange(d, stay.booking_end, '[)')
          )
        order by random()
        limit rooms_needed
      ) c;
    end if;
  end loop;
end
$$;

-- Verification: daily occupancy for the admin dashboard window.
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
   and daterange(b.start_date, b.end_date, '[)') &&
       daterange(d.day, d.day + 1, '[)')
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

-- Verification: category-level variation, similar to the admin calendar.
with days as (
  select (current_date + offs)::date as day
  from generate_series(0, 6) offs
),
room_categories as (
  select
    r.id,
    case
      when lower(r.type) like '%economy%' then 'economy'
      when lower(r.type) like '%superior%' then 'superior'
      when lower(r.type) like '%deluxe%' then 'deluxe'
      when lower(r.type) like '%attic%' then 'attic'
      else 'other'
    end as category
  from public.rooms r
  where r.is_available = true
),
category_totals as (
  select category, count(*)::int as total_rooms
  from room_categories
  group by category
)
select
  d.day,
  rc.category,
  count(distinct b.room_id)::int as occupied_rooms,
  ct.total_rooms
from days d
join room_categories rc on true
join category_totals ct on ct.category = rc.category
left join public.bookings b
  on b.room_id = rc.id
 and b.status in ('pending', 'confirmed')
 and daterange(b.start_date, b.end_date, '[)') &&
     daterange(d.day, d.day + 1, '[)')
where rc.category in ('economy', 'superior', 'deluxe', 'attic')
group by d.day, rc.category, ct.total_rooms
order by d.day, rc.category;
