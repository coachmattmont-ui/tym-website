-- Homepage A/B events. Pages Functions insert with the service role.
-- The anon key can insert and cannot read, update, or delete.
-- Apply in the Supabase SQL editor for project ayvfwykxpvmmmvakhlcf.

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  variant text,
  path text,
  constraint events_name check (
    name in (
      'hero_cta_click',
      'secondary_link_click',
      'instant_quote_completed',
      'layout_checkout_started'
    )
  ),
  constraint events_variant check (variant is null or variant in ('a', 'b')),
  constraint events_path check (path is null or char_length(path) <= 180)
);

comment on table public.events is
  'Anonymous homepage events. No email and no name. variant is the tym_hp cookie (a or b).';

alter table public.events enable row level security;

drop policy if exists events_insert_only on public.events;
create policy events_insert_only
  on public.events
  for insert
  to anon, authenticated
  with check (
    name in (
      'hero_cta_click',
      'secondary_link_click',
      'instant_quote_completed',
      'layout_checkout_started'
    )
    and (variant is null or variant in ('a', 'b'))
  );

revoke all on table public.events from public, anon, authenticated;
grant insert on table public.events to anon, authenticated;
