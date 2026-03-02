-- 05_inventory_and_occupancy.sql
-- Run in Supabase SQL Editor (production/server).
-- Guarantees ACTIVE inventory of:
--   8 economy, 12 superior, 4 deluxe, 1 attic suite
-- Extras are retained as historical rows but set is_available = false.
-- Then adjusts next-night occupancy near 60% and keeps attic available.

create extension if not exists pgcrypto;

alter table public.rooms
  add column if not exists description_i18n jsonb not null default '{}'::jsonb;

-- 1) Ensure enough rooms exist per category (insert missing only).
with desired as (
  select *
  from (values
    ('economy', 8, 18000, 'Economy Workroom',
      'Focused workspace in our historic farmhouse. Perfect for deep focus sessions.',
      'Fokussierter Arbeitsraum in unserem historischen Bauernhaus. Perfekt fuer Deep-Work-Sessions.'),
    ('superior', 12, 19500, 'Superior Garden View',
      'Panoramic views of the Altmuhltal nature with a premium ergonomic setup.',
      'Panoramablick ins Altmuehltal mit hochwertigem ergonomischem Setup.'),
    ('deluxe', 4, 22000, 'Deluxe Business Suite',
      'Premium executive suite with high-end conferencing tech and extra comfort.',
      'Premium Executive Suite mit hochwertiger Konferenztechnik und extra Komfort.'),
    ('attic', 1, 25000, 'The 1886 Attic Suite',
      'Our flagship luxury suite in the historic attic. Maximum privacy and classic atmosphere.',
      'Unsere Flagship-Luxussuite im historischen Dachgeschoss. Maximale Privatsphaere und klassisches Ambiente.')
  ) as t(category, target_count, price_cents, base_name, desc_en, desc_de)
),
current_counts as (
  select
    d.*,
    coalesce((
      select count(*)
      from public.rooms r
      where
        (d.category = 'economy' and lower(r.type) like '%economy%')
        or (d.category = 'superior' and lower(r.type) like '%superior%')
        or (d.category = 'deluxe' and lower(r.type) like '%deluxe%')
        or (d.category = 'attic' and lower(r.type) like '%attic%')
    ), 0) as current_count
  from desired d
)
insert into public.rooms (id, type, price_cents, description, description_i18n, is_available)
select
  gen_random_uuid(),
  case
    when c.category = 'attic' then c.base_name
    else format('%s %s', c.base_name, lpad(gs.n::text, 2, '0'))
  end as type,
  c.price_cents,
  c.desc_en,
  jsonb_build_object('en', c.desc_en, 'de', c.desc_de),
  false
from current_counts c
join lateral generate_series(c.current_count + 1, c.target_count) as gs(n)
  on c.current_count < c.target_count;

-- 2) Disable all rooms first, then activate exactly target counts by category.
update public.rooms
set is_available = false;

with ranked as (
  select
    r.id,
    case
      when lower(r.type) like '%economy%' then 'economy'
      when lower(r.type) like '%superior%' then 'superior'
      when lower(r.type) like '%deluxe%' then 'deluxe'
      when lower(r.type) like '%attic%' then 'attic'
      else null
    end as category,
    row_number() over (
      partition by case
        when lower(r.type) like '%economy%' then 'economy'
        when lower(r.type) like '%superior%' then 'superior'
        when lower(r.type) like '%deluxe%' then 'deluxe'
        when lower(r.type) like '%attic%' then 'attic'
        else null
      end
      order by r.id
    ) as rn
  from public.rooms r
),
targets as (
  select * from (values
    ('economy', 8),
    ('superior', 12),
    ('deluxe', 4),
    ('attic', 1)
  ) as t(category, target_count)
)
update public.rooms r
set is_available = true
from ranked rk
join targets t
  on t.category = rk.category
 and rk.rn <= t.target_count
where r.id = rk.id;

-- 3) Canonicalize ACTIVE room metadata for UI consistency.
with active_ranked as (
  select
    r.id,
    case
      when lower(r.type) like '%economy%' then 'economy'
      when lower(r.type) like '%superior%' then 'superior'
      when lower(r.type) like '%deluxe%' then 'deluxe'
      when lower(r.type) like '%attic%' then 'attic'
      else null
    end as category,
    row_number() over (
      partition by case
        when lower(r.type) like '%economy%' then 'economy'
        when lower(r.type) like '%superior%' then 'superior'
        when lower(r.type) like '%deluxe%' then 'deluxe'
        when lower(r.type) like '%attic%' then 'attic'
        else null
      end
      order by r.id
    ) as rn
  from public.rooms r
  where r.is_available = true
)
update public.rooms r
set
  type = case ar.category
    when 'economy' then format('Economy Workroom %s', lpad(ar.rn::text, 2, '0'))
    when 'superior' then format('Superior Garden View %s', lpad(ar.rn::text, 2, '0'))
    when 'deluxe' then format('Deluxe Business Suite %s', lpad(ar.rn::text, 2, '0'))
    when 'attic' then 'The 1886 Attic Suite'
    else r.type
  end,
  price_cents = case ar.category
    when 'economy' then 18000
    when 'superior' then 19500
    when 'deluxe' then 22000
    when 'attic' then 25000
    else r.price_cents
  end,
  description = case ar.category
    when 'economy' then 'Focused workspace in our historic farmhouse. Perfect for deep focus sessions.'
    when 'superior' then 'Panoramic views of the Altmuhltal nature with a premium ergonomic setup.'
    when 'deluxe' then 'Premium executive suite with high-end conferencing tech and extra comfort.'
    when 'attic' then 'Our flagship luxury suite in the historic attic. Maximum privacy and classic atmosphere.'
    else r.description
  end,
  description_i18n = case ar.category
    when 'economy' then coalesce(r.description_i18n, '{}'::jsonb) ||
      jsonb_build_object(
        'en', 'Focused workspace in our historic farmhouse. Perfect for deep focus sessions.',
        'de', 'Fokussierter Arbeitsraum in unserem historischen Bauernhaus. Perfekt fuer Deep-Work-Sessions.'
      )
    when 'superior' then coalesce(r.description_i18n, '{}'::jsonb) ||
      jsonb_build_object(
        'en', 'Panoramic views of the Altmuhltal nature with a premium ergonomic setup.',
        'de', 'Panoramablick ins Altmuehltal mit hochwertigem ergonomischem Setup.'
      )
    when 'deluxe' then coalesce(r.description_i18n, '{}'::jsonb) ||
      jsonb_build_object(
        'en', 'Premium executive suite with high-end conferencing tech and extra comfort.',
        'de', 'Premium Executive Suite mit hochwertiger Konferenztechnik und extra Komfort.'
      )
    when 'attic' then coalesce(r.description_i18n, '{}'::jsonb) ||
      jsonb_build_object(
        'en', 'Our flagship luxury suite in the historic attic. Maximum privacy and classic atmosphere.',
        'de', 'Unsere Flagship-Luxussuite im historischen Dachgeschoss. Maximale Privatsphaere und klassisches Ambiente.'
      )
    else r.description_i18n
  end
from active_ranked ar
where r.id = ar.id;

-- 4) Keep attic suite available (cancel future active attic bookings).
update public.bookings b
set status = 'cancelled'
from public.rooms r
where b.room_id = r.id
  and lower(r.type) like '%attic%'
  and b.status in ('pending', 'confirmed')
  and b.end_date > current_date;

-- 5) Set occupancy near 60% for next night based on ACTIVE rooms only.
-- Target 14-16 occupied rooms out of 25 (around 60%), midpoint = 15.
do $$
declare
  occ_start date := current_date + 1;
  occ_end date := current_date + 2;
  target_min integer := 14;
  target_max integer := 16;
  target_mid integer := 15;
  current_occupied integer;
  adjust_count integer;
  sample_user uuid;
begin
  select id into sample_user from auth.users order by created_at nulls last limit 1;
  if sample_user is null then
    raise exception 'No auth.users row found. Create at least one user, then re-run this block.';
  end if;

  select count(distinct b.room_id)
  into current_occupied
  from public.bookings b
  join public.rooms r on r.id = b.room_id
  where b.status in ('pending', 'confirmed')
    and r.is_available = true
    and lower(r.type) not like '%attic%'
    and daterange(b.start_date, b.end_date, '[)') &&
        daterange(occ_start, occ_end, '[)');

  if current_occupied < target_min then
    adjust_count := target_mid - current_occupied;

    insert into public.bookings (user_id, room_id, start_date, end_date, status)
    select
      sample_user,
      r.id,
      occ_start,
      occ_end,
      'confirmed'
    from public.rooms r
    where r.is_available = true
      and lower(r.type) not like '%attic%'
      and not exists (
        select 1
        from public.bookings b
        where b.room_id = r.id
          and b.status in ('pending', 'confirmed')
          and daterange(b.start_date, b.end_date, '[)') &&
              daterange(occ_start, occ_end, '[)')
      )
    order by r.type, r.id
    limit greatest(adjust_count, 0);
  elsif current_occupied > target_max then
    adjust_count := current_occupied - target_mid;

    with bookings_to_cancel as (
      select b.id
      from public.bookings b
      join public.rooms r on r.id = b.room_id
      where b.status in ('pending', 'confirmed')
        and r.is_available = true
        and lower(r.type) not like '%attic%'
        and daterange(b.start_date, b.end_date, '[)') &&
            daterange(occ_start, occ_end, '[)')
      order by
        case when b.status = 'pending' then 0 else 1 end,
        b.created_at desc nulls last,
        b.id desc
      limit greatest(adjust_count, 0)
    )
    update public.bookings b
    set status = 'cancelled'
    where b.id in (select id from bookings_to_cancel);
  end if;
end
$$;

-- 6) Final report.
with active_category_counts as (
  select
    case
      when lower(type) like '%economy%' then 'economy'
      when lower(type) like '%superior%' then 'superior'
      when lower(type) like '%deluxe%' then 'deluxe'
      when lower(type) like '%attic%' then 'attic'
      else 'other'
    end as category,
    count(*) as active_room_count
  from public.rooms
  where is_available = true
  group by 1
),
next_night_occ as (
  select count(distinct b.room_id) as occupied_rooms
  from public.bookings b
  join public.rooms r on r.id = b.room_id
  where b.status in ('pending', 'confirmed')
    and r.is_available = true
    and daterange(b.start_date, b.end_date, '[)') &&
        daterange(current_date + 1, current_date + 2, '[)')
),
totals as (
  select count(*) as total_active_rooms
  from public.rooms
  where is_available = true
)
select
  c.category,
  c.active_room_count,
  t.total_active_rooms,
  o.occupied_rooms,
  round((o.occupied_rooms::numeric / nullif(t.total_active_rooms, 0)) * 100, 1) as occupancy_pct_next_night
from active_category_counts c
cross join totals t
cross join next_night_occ o
order by c.category;

-- Attic must be available next night.
select
  r.id,
  r.type,
  r.is_available,
  public.is_room_available(r.id, current_date + 1, current_date + 2) as available_next_night
from public.rooms r
where r.is_available = true
  and lower(r.type) like '%attic%';
