-- 11_reseed_70pct_until_year_end_preserve_real.sql
-- Seeds baseline occupancy to ~70% for each day from today until Dec 31.
-- IMPORTANT:
-- - Does NOT delete/cancel existing bookings.
-- - Preserves all real bookings.
-- - Only inserts additional 1-night "baseline" bookings when occupancy is below target.
-- - Tries to avoid attic for fake baseline so it stays more available.

do $$
declare
  seed_user_id uuid;
begin
  -- Prefer non-admin user for baseline rows; fallback to any user.
  select id
  into seed_user_id
  from auth.users
  where lower(coalesce(email, '')) <> 'admin@example.com'
  order by created_at nulls last
  limit 1;

  if seed_user_id is null then
    select id
    into seed_user_id
    from auth.users
    order by created_at nulls last
    limit 1;
  end if;

  if seed_user_id is null then
    raise exception 'No auth.users row found. Create at least one user and re-run.';
  end if;

  with cfg as (
    select
      current_date::date as from_day,
      make_date(extract(year from current_date)::int, 12, 31)::date as to_day
  ),
  days as (
    select gs.day::date as day
    from cfg
    join lateral generate_series(cfg.from_day, cfg.to_day, interval '1 day') as gs(day) on true
  ),
  active_rooms as (
    select
      r.id,
      case
        when lower(r.type) like '%attic%' then true
        else false
      end as is_attic
    from public.rooms r
    where r.is_available = true
  ),
  totals as (
    select
      count(*)::int as total_active_rooms
    from active_rooms
  ),
  daily_occupied as (
    select
      d.day,
      count(distinct b.room_id)::int as occupied_rooms
    from days d
    left join public.bookings b
      on b.status in ('pending', 'confirmed')
     and daterange(b.start_date, b.end_date, '[)') &&
         daterange(d.day, d.day + 1, '[)')
    left join active_rooms ar on ar.id = b.room_id
    where ar.id is not null
    group by d.day
  ),
  daily_need as (
    select
      d.day,
      greatest(
        0,
        ceil((t.total_active_rooms * 0.70)::numeric)::int - coalesce(o.occupied_rooms, 0)
      ) as rooms_needed
    from days d
    cross join totals t
    left join daily_occupied o on o.day = d.day
  ),
  candidates as (
    select
      dn.day,
      ar.id as room_id,
      row_number() over (
        partition by dn.day
        order by
          case when ar.is_attic then 1 else 0 end,
          ar.id
      ) as rn
    from daily_need dn
    join active_rooms ar on true
    where dn.rooms_needed > 0
      and not exists (
        select 1
        from public.bookings b
        where b.room_id = ar.id
          and b.status in ('pending', 'confirmed')
          and daterange(b.start_date, b.end_date, '[)') &&
              daterange(dn.day, dn.day + 1, '[)')
      )
  )
  insert into public.bookings (user_id, room_id, start_date, end_date, status)
  select
    seed_user_id,
    c.room_id,
    c.day,
    c.day + 1,
    'confirmed'
  from candidates c
  join daily_need dn on dn.day = c.day
  where c.rn <= dn.rooms_needed;
end
$$;

-- Report for quick verification.
with cfg as (
  select
    current_date::date as from_day,
    make_date(extract(year from current_date)::int, 12, 31)::date as to_day
),
days as (
  select gs.day::date as day
  from cfg
  join lateral generate_series(cfg.from_day, cfg.to_day, interval '1 day') as gs(day) on true
),
active_rooms as (
  select id
  from public.rooms
  where is_available = true
),
totals as (
  select count(*)::int as total_active_rooms
  from active_rooms
),
daily_occupied as (
  select
    d.day,
    count(distinct b.room_id)::int as occupied_rooms
  from days d
  left join public.bookings b
    on b.status in ('pending', 'confirmed')
   and daterange(b.start_date, b.end_date, '[)') &&
       daterange(d.day, d.day + 1, '[)')
  left join active_rooms ar on ar.id = b.room_id
  where ar.id is not null
  group by d.day
)
select
  d.day,
  coalesce(o.occupied_rooms, 0) as occupied_rooms,
  t.total_active_rooms,
  round((coalesce(o.occupied_rooms, 0)::numeric / nullif(t.total_active_rooms, 0)) * 100, 1) as occupancy_pct
from days d
cross join totals t
left join daily_occupied o on o.day = d.day
order by d.day;
