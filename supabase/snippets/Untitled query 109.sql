create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  price_cents integer not null check (price_cents >= 0),
  is_available boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  room_id uuid not null references public.rooms (id) on delete restrict,
  start_date date not null,
  end_date date not null,
  status text not null default 'confirmed' check (status in ('confirmed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint bookings_date_range check (end_date > start_date)
);

create index if not exists idx_rooms_available on public.rooms (is_available);
create index if not exists idx_bookings_user_id on public.bookings (user_id);
create index if not exists idx_bookings_room_dates on public.bookings (room_id, start_date, end_date);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_rooms_updated_at on public.rooms;
create trigger trg_rooms_updated_at
before update on public.rooms
for each row execute function public.set_updated_at();

drop trigger if exists trg_bookings_updated_at on public.bookings;
create trigger trg_bookings_updated_at
before update on public.bookings
for each row execute function public.set_updated_at();

alter table public.rooms enable row level security;
alter table public.bookings enable row level security;

drop policy if exists "Rooms are readable by everyone" on public.rooms;
create policy "Rooms are readable by everyone"
on public.rooms
for select
to anon, authenticated
using (true);

drop policy if exists "Users can read own bookings" on public.bookings;
create policy "Users can read own bookings"
on public.bookings
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can create own bookings" on public.bookings;
create policy "Users can create own bookings"
on public.bookings
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update own bookings" on public.bookings;
create policy "Users can update own bookings"
on public.bookings
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own bookings" on public.bookings;
create policy "Users can delete own bookings"
on public.bookings
for delete
to authenticated
using (auth.uid() = user_id);