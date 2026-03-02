-- 08_service_bookings.sql
-- Run in Supabase SQL Editor (local + production).
-- Creates a service bookings table and owner/admin-safe RLS policies.

create extension if not exists pgcrypto;

create table if not exists public.service_bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  service_code text not null,
  service_title text not null,
  service_date date not null,
  participants integer not null default 1,
  unit_price_cents integer not null default 0,
  total_price_cents integer not null default 0,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint service_bookings_status_check check (status in ('pending', 'confirmed', 'cancelled')),
  constraint service_bookings_participants_check check (participants between 1 and 20),
  constraint service_bookings_prices_check check (unit_price_cents >= 0 and total_price_cents >= 0)
);

create index if not exists service_bookings_user_idx
  on public.service_bookings (user_id);

create index if not exists service_bookings_date_idx
  on public.service_bookings (service_date);

alter table public.service_bookings enable row level security;

-- Reset policies for deterministic behavior.
do $$
declare pol record;
begin
  for pol in
    select policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = 'service_bookings'
  loop
    execute format('drop policy if exists %I on public.service_bookings', pol.policyname);
  end loop;
end
$$;

-- Owners can see/manage only their own rows.
create policy service_bookings_select_own
  on public.service_bookings
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy service_bookings_insert_own
  on public.service_bookings
  for insert
  to authenticated
  with check (
    auth.uid() = user_id
    and status in ('pending', 'confirmed', 'cancelled')
    and participants between 1 and 20
    and unit_price_cents >= 0
    and total_price_cents >= 0
  );

create policy service_bookings_update_own
  on public.service_bookings
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and status in ('pending', 'confirmed', 'cancelled')
    and participants between 1 and 20
    and unit_price_cents >= 0
    and total_price_cents >= 0
  );

create policy service_bookings_delete_own
  on public.service_bookings
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- Admin read access for dashboards/ops.
create policy service_bookings_select_admin_all
  on public.service_bookings
  for select
  to authenticated
  using (
    lower(coalesce(auth.jwt() ->> 'email', '')) in ('admin@example.com')
  );

grant select, insert, update, delete on public.service_bookings to authenticated;
revoke all on public.service_bookings from anon;
