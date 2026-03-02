-- 04_verification.sql
-- Run after 01/02/03 to verify DB state.

-- 1) Find overlap conflicts that would violate bookings_no_overlap_active.
select
  b1.id as booking_a,
  b2.id as booking_b,
  b1.room_id,
  b1.start_date as a_start,
  b1.end_date as a_end,
  b2.start_date as b_start,
  b2.end_date as b_end,
  b1.status as a_status,
  b2.status as b_status
from public.bookings b1
join public.bookings b2
  on b1.room_id = b2.room_id
 and b1.id < b2.id
 and b1.status in ('pending', 'confirmed')
 and b2.status in ('pending', 'confirmed')
 and daterange(b1.start_date, b1.end_date, '[)') &&
     daterange(b2.start_date, b2.end_date, '[)');

-- 2) Confirm required constraints exist.
select conname, contype
from pg_constraint
where conrelid = 'public.bookings'::regclass
  and conname in ('bookings_valid_date_range', 'bookings_no_overlap_active')
order by conname;

-- 3) Confirm policies currently active.
select schemaname, tablename, policyname, roles, cmd
from pg_policies
where schemaname = 'public'
  and tablename in ('bookings', 'rooms')
order by tablename, policyname;

-- 4) Confirm availability function exists and executes.
select routine_name, routine_schema
from information_schema.routines
where routine_schema = 'public'
  and routine_name = 'is_room_available';

-- Example call (replace values with real room/date values):
-- select public.is_room_available(
--   '00000000-0000-0000-0000-000000000000',
--   '2026-03-01'::date,
--   '2026-03-02'::date
-- );

-- 5) Confirm localized description column is present.
select column_name, data_type
from information_schema.columns
where table_schema = 'public'
  and table_name = 'rooms'
  and column_name = 'description_i18n';
