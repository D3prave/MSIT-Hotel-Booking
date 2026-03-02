-- 10_conversion_waitlist_and_service_slots.sql
-- Run in Supabase SQL Editor (local + production).
-- Adds:
-- 1) service booking time slots
-- 2) room waitlist table + RLS
-- 3) public safe availability summary RPC for booking conversion calendar

create extension if not exists pgcrypto;

-- 1) Service booking time slots
alter table public.service_bookings
  add column if not exists service_time_slot text;

update public.service_bookings
set service_time_slot = coalesce(
  nullif(substring(service_time_slot from '([0-2][0-9]:[0-5][0-9])'), ''),
  '08:00'
)
where service_time_slot is null
   or service_time_slot like '%-%';

alter table public.service_bookings
  alter column service_time_slot set default '08:00';

alter table public.service_bookings
  alter column service_time_slot set not null;

alter table public.service_bookings
  drop constraint if exists service_bookings_time_slot_check;

alter table public.service_bookings
  add constraint service_bookings_time_slot_check
  check (
    service_time_slot in (
      '08:00',
      '10:30',
      '13:00',
      '16:00',
      '18:30'
    )
  );

create index if not exists service_bookings_slot_idx
  on public.service_bookings (service_date, service_code, service_time_slot);

-- 2) Room waitlist
create table if not exists public.room_waitlist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  user_email text null,
  room_category text not null
    check (room_category in ('economy', 'superior', 'deluxe', 'attic')),
  start_date date not null,
  end_date date not null,
  status text not null default 'open'
    check (status in ('open', 'converted', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint room_waitlist_date_range_check check (start_date < end_date)
);

create index if not exists room_waitlist_user_idx
  on public.room_waitlist (user_id, created_at desc);

create index if not exists room_waitlist_category_dates_idx
  on public.room_waitlist (room_category, start_date, end_date)
  where status = 'open';

create unique index if not exists room_waitlist_unique_open_idx
  on public.room_waitlist (user_id, room_category, start_date, end_date)
  where status = 'open';

alter table public.room_waitlist enable row level security;

do $$
declare pol record;
begin
  for pol in
    select policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = 'room_waitlist'
  loop
    execute format('drop policy if exists %I on public.room_waitlist', pol.policyname);
  end loop;
end
$$;

create policy room_waitlist_select_own
  on public.room_waitlist
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy room_waitlist_insert_own
  on public.room_waitlist
  for insert
  to authenticated
  with check (
    auth.uid() = user_id
    and room_category in ('economy', 'superior', 'deluxe', 'attic')
    and start_date < end_date
    and status in ('open', 'converted', 'cancelled')
  );

create policy room_waitlist_update_own
  on public.room_waitlist
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and room_category in ('economy', 'superior', 'deluxe', 'attic')
    and start_date < end_date
    and status in ('open', 'converted', 'cancelled')
  );

create policy room_waitlist_delete_own
  on public.room_waitlist
  for delete
  to authenticated
  using (auth.uid() = user_id);

create policy room_waitlist_select_admin_all
  on public.room_waitlist
  for select
  to authenticated
  using (
    lower(coalesce(auth.jwt() ->> 'email', '')) in ('admin@example.com')
  );

grant select, insert, update, delete on public.room_waitlist to authenticated;
revoke all on public.room_waitlist from anon;

-- 3) Public-safe availability summary for conversion calendar
create or replace function public.get_room_category_availability(
  start_date_param date default current_date,
  days_param integer default 7
)
returns table (
  day date,
  category text,
  total_rooms integer,
  available_rooms integer
)
language sql
stable
security definer
set search_path = public
as $$
  with params as (
    select
      coalesce(start_date_param, current_date) as start_day,
      greatest(coalesce(days_param, 7), 1) as day_count
  ),
  days as (
    select (p.start_day + gs.day_offset)::date as day
    from params p
    join lateral generate_series(0, p.day_count - 1) as gs(day_offset) on true
  ),
  categories as (
    select * from (values
      ('economy'::text),
      ('superior'::text),
      ('deluxe'::text),
      ('attic'::text)
    ) as c(category)
  ),
  active_rooms as (
    select
      r.id,
      case
        when lower(r.type) like '%economy%' then 'economy'
        when lower(r.type) like '%superior%' then 'superior'
        when lower(r.type) like '%deluxe%' then 'deluxe'
        when lower(r.type) like '%attic%' then 'attic'
        else null
      end as category
    from public.rooms r
    where r.is_available = true
  ),
  totals as (
    select
      c.category,
      count(ar.id)::int as total_rooms
    from categories c
    left join active_rooms ar on ar.category = c.category
    group by c.category
  ),
  occupied as (
    select
      d.day,
      ar.category,
      count(distinct ar.id)::int as occupied_rooms
    from days d
    join active_rooms ar on ar.category is not null
    join public.bookings b
      on b.room_id = ar.id
     and b.status in ('pending', 'confirmed')
     and daterange(b.start_date, b.end_date, '[)') &&
         daterange(d.day, d.day + 1, '[)')
    group by d.day, ar.category
  )
  select
    d.day,
    c.category,
    t.total_rooms,
    greatest(t.total_rooms - coalesce(o.occupied_rooms, 0), 0)::int as available_rooms
  from days d
  cross join categories c
  join totals t on t.category = c.category
  left join occupied o on o.day = d.day and o.category = c.category
  order by d.day, c.category;
$$;

revoke all on function public.get_room_category_availability(date, integer) from public;
grant execute on function public.get_room_category_availability(date, integer) to anon, authenticated;
