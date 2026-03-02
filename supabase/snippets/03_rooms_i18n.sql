-- 03_rooms_i18n.sql
-- Run in Supabase SQL Editor (production/server).
-- Adds per-locale room descriptions consumed by the app.

alter table public.rooms
  add column if not exists description_i18n jsonb not null default '{}'::jsonb;

-- Backfill English from the existing description column.
update public.rooms
set description_i18n =
  jsonb_strip_nulls(
    coalesce(description_i18n, '{}'::jsonb) ||
    jsonb_build_object('en', description)
  )
where description is not null
  and coalesce(description_i18n->>'en', '') = '';

-- Optional German starter content by room type keywords.
update public.rooms
set description_i18n =
  description_i18n ||
  jsonb_build_object(
    'de',
    case
      when lower(type) like '%economy%' then 'Fokussierter Arbeitsraum in unserem historischen Bauernhaus. Perfekt fuer Deep-Work-Sessions.'
      when lower(type) like '%superior%' then 'Panoramablick ins Altmuehltal mit hochwertigem ergonomischem Setup.'
      when lower(type) like '%deluxe%' then 'Premium Executive Suite mit hochwertiger Konferenztechnik und extra Komfort.'
      when lower(type) like '%attic%' or lower(type) like '%suite%' then 'Unsere Flagship-Luxussuite im historischen Dachgeschoss. Maximale Privatsphaere und klassisches Ambiente.'
      else null
    end
  )
where coalesce(description_i18n->>'de', '') = '';
