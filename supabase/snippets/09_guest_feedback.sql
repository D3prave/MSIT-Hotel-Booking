-- 09_guest_feedback.sql
-- Collects feedback comments from website visitors/guests.

create table if not exists public.guest_feedback (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  guest_name text not null check (char_length(trim(guest_name)) between 2 and 120),
  user_id uuid null references auth.users(id) on delete set null,
  user_email text null,
  locale text not null default 'en' check (locale in ('en', 'de')),
  source text not null default 'website',
  comment text not null check (char_length(trim(comment)) between 1 and 1200)
);

alter table public.guest_feedback
  add column if not exists guest_name text;

update public.guest_feedback
set guest_name = coalesce(nullif(split_part(user_email, '@', 1), ''), 'Guest')
where guest_name is null;

alter table public.guest_feedback
  alter column guest_name set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'guest_feedback_guest_name_len'
  ) then
    alter table public.guest_feedback
      add constraint guest_feedback_guest_name_len
      check (char_length(trim(guest_name)) between 2 and 120);
  end if;
end
$$;

do $$
declare
  old_constraint record;
begin
  for old_constraint in
    select conname
    from pg_constraint
    where conrelid = 'public.guest_feedback'::regclass
      and pg_get_constraintdef(oid) ilike '%char_length(trim(comment)) between 12 and 1200%'
  loop
    execute format('alter table public.guest_feedback drop constraint %I', old_constraint.conname);
  end loop;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'guest_feedback_comment_len'
  ) then
    alter table public.guest_feedback
      add constraint guest_feedback_comment_len
      check (char_length(trim(comment)) between 1 and 1200);
  end if;
end
$$;

create index if not exists guest_feedback_created_at_idx
  on public.guest_feedback (created_at desc);
create index if not exists guest_feedback_user_email_idx
  on public.guest_feedback (user_email);

alter table public.guest_feedback enable row level security;

drop policy if exists guest_feedback_insert_any on public.guest_feedback;
create policy guest_feedback_insert_any
  on public.guest_feedback
  for insert
  to anon, authenticated
  with check (true);

grant insert on table public.guest_feedback to anon, authenticated;
