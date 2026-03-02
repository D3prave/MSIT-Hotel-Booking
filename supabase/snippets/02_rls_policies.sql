-- 02_rls_policies.sql
-- Run in Supabase SQL Editor (production/server).
-- This resets bookings/rooms policies to a least-privilege baseline.

alter table public.bookings enable row level security;
alter table public.rooms enable row level security;

-- Drop all current bookings policies so we do not keep stale permissive rules.
do $$
declare pol record;
begin
  for pol in
    select policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = 'bookings'
  loop
    execute format('drop policy if exists %I on public.bookings', pol.policyname);
  end loop;
end
$$;

-- Drop all current rooms policies for a clean, explicit baseline.
do $$
declare pol record;
begin
  for pol in
    select policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = 'rooms'
  loop
    execute format('drop policy if exists %I on public.rooms', pol.policyname);
  end loop;
end
$$;

-- Bookings: users can only see/change their own rows.
create policy bookings_select_own
  on public.bookings
  for select
  to authenticated
  using (auth.uid() = user_id);

-- Admin read access for dashboard (replace email list as needed).
-- This policy is additive: normal users still only see their own rows.
create policy bookings_select_admin_all
  on public.bookings
  for select
  to authenticated
  using (
    lower(coalesce(auth.jwt() ->> 'email', '')) in ('admin@example.com')
  );

create policy bookings_insert_own
  on public.bookings
  for insert
  to authenticated
  with check (
    auth.uid() = user_id
    and start_date < end_date
    and status in ('pending', 'confirmed', 'cancelled')
  );

create policy bookings_update_own
  on public.bookings
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and start_date < end_date
    and status in ('pending', 'confirmed', 'cancelled')
  );

create policy bookings_delete_own
  on public.bookings
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- Rooms metadata is public read-only for UI listing.
create policy rooms_select_public
  on public.rooms
  for select
  to anon, authenticated
  using (true);

-- Privileges (RLS still applies).
grant select on public.rooms to anon, authenticated;
grant select, insert, update, delete on public.bookings to authenticated;
revoke all on public.bookings from anon;
