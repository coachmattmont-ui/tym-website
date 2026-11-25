-- Layout Tool: one account, many projects. A single-use payment opens editing
-- on ONE project (every floor and page in that project) for 30 days.
-- After edit_until, the row stays readable forever and updates are rejected.
-- A later subscription can insert entitlements.kind = 'subscription' and set
-- edit_until. This migration does not create subscription billing.
--
-- Run in the Supabase SQL editor, or with the Supabase CLI, before going live.
-- The Pages Functions use the service role to create projects and grant time.
-- Signed-in clients use the anon key. They can read their rows and update a
-- project only while edit_until is still in the future.

create extension if not exists pgcrypto;

create table if not exists public.projects (
  id uuid primary key,
  owner uuid not null references auth.users (id) on delete cascade,
  name text not null default 'Untitled project',
  layout jsonb not null default '{"version":2}'::jsonb,
  edit_until timestamptz,
  pdf_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint projects_name_len check (char_length(name) between 1 and 120),
  constraint projects_layout_object check (jsonb_typeof(layout) = 'object'),
  constraint projects_layout_size check (octet_length(layout::text) < 1500000),
  constraint projects_pdf_path check (
    pdf_path is null
    or pdf_path ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}\.pdf$'
  )
);

comment on table public.projects is
  'Layout Tool projects. layout is schema v2 JSON (rooms, devices, page names). Prices are not stored. pdf_path points at the private plan-pdfs bucket. edit_until is the editing window. Null means the checkout has not been paid. Only the account email lives in auth.users. Do not add client contact columns.';

comment on column public.projects.edit_until is
  'Editing is allowed only while this timestamp is in the future. The Stripe webhook sets it to now + 30 days. Clients cannot change it.';

create index if not exists projects_owner_updated_idx
  on public.projects (owner, updated_at desc);

-- kind = subscription is accepted so a future plan can grant access without a
-- schema change. The app only inserts kind = single_use today.
create table if not exists public.entitlements (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  owner uuid not null references auth.users (id) on delete cascade,
  kind text not null,
  status text not null default 'active',
  source text not null default 'stripe_checkout',
  stripe_session_id text,
  stripe_payment_intent text,
  amount_cents integer,
  currency text default 'usd',
  edit_until timestamptz not null,
  created_at timestamptz not null default now(),
  constraint entitlements_kind check (kind in ('single_use', 'subscription')),
  constraint entitlements_status check (status in ('active', 'expired', 'revoked')),
  constraint entitlements_session unique (stripe_session_id)
);

comment on table public.entitlements is
  'One row per paid grant. single_use is the Stripe Checkout payment. subscription is reserved and unused. Webhook writes are idempotent on stripe_session_id. No customer name, address, or phone is stored.';

create index if not exists entitlements_project_idx
  on public.entitlements (project_id, created_at desc);

create or replace function public.protect_project_columns()
returns trigger
language plpgsql
security invoker
as $$
begin
  if current_user in ('service_role', 'supabase_admin', 'postgres') then
    return new;
  end if;
  if tg_op = 'INSERT' then
    new.owner := auth.uid();
    new.edit_until := null;
    new.created_at := now();
  elsif tg_op = 'UPDATE' then
    new.id := old.id;
    new.owner := old.owner;
    new.edit_until := old.edit_until;
    new.created_at := old.created_at;
  end if;
  return new;
end;
$$;

create or replace function public.touch_project_updated_at()
returns trigger
language plpgsql
security invoker
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists projects_protect_columns on public.projects;
create trigger projects_protect_columns
  before insert or update on public.projects
  for each row execute function public.protect_project_columns();

drop trigger if exists projects_touch_updated on public.projects;
create trigger projects_touch_updated
  before update on public.projects
  for each row execute function public.touch_project_updated_at();

revoke all on function public.protect_project_columns() from public, anon, authenticated;
revoke all on function public.touch_project_updated_at() from public, anon, authenticated;

alter table public.projects enable row level security;
alter table public.entitlements enable row level security;

revoke all on public.projects from anon, authenticated;
grant select, update on public.projects to authenticated;

revoke all on public.entitlements from anon, authenticated;
grant select on public.entitlements to authenticated;

grant all on public.projects to service_role;
grant all on public.entitlements to service_role;

drop policy if exists projects_select_own on public.projects;
create policy projects_select_own
  on public.projects
  for select
  to authenticated
  using (owner = auth.uid());

drop policy if exists projects_update_while_editable on public.projects;
create policy projects_update_while_editable
  on public.projects
  for update
  to authenticated
  using (owner = auth.uid() and edit_until is not null and edit_until > now())
  with check (owner = auth.uid() and edit_until is not null and edit_until > now());

drop policy if exists entitlements_select_own on public.entitlements;
create policy entitlements_select_own
  on public.entitlements
  for select
  to authenticated
  using (owner = auth.uid());

insert into storage.buckets (id, name, public, file_size_limit)
values ('plan-pdfs', 'plan-pdfs', false, 20971520)
on conflict (id) do update set public = false, file_size_limit = 20971520;

drop policy if exists plan_pdfs_read_own on storage.objects;
create policy plan_pdfs_read_own
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'plan-pdfs'
    and name = (auth.uid()::text || '/' || split_part(name, '/', 2))
    and name ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}\.pdf$'
  );

drop policy if exists plan_pdfs_insert_editable on storage.objects;
create policy plan_pdfs_insert_editable
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'plan-pdfs'
    and name ~ ('^' || auth.uid()::text || '/[0-9a-f-]{36}\.pdf$')
    and exists (
      select 1 from public.projects p
      where p.owner = auth.uid()
        and p.id::text = split_part(split_part(name, '/', 2), '.', 1)
        and p.edit_until is not null
        and p.edit_until > now()
    )
  );

-- A checkout is not a project. The row is created only after Stripe reports
-- the payment, in the same step as the entitlement. One open checkout per
-- user and purpose (a new project, or a re-unlock of one existing project)
-- so a double click cannot start two payments.
create table if not exists public.pending_checkouts (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null references auth.users (id) on delete cascade,
  project_id uuid references public.projects (id) on delete cascade,
  reserved_project_id uuid not null,
  stripe_session_id text unique,
  checkout_url text,
  status text not null default 'open',
  seed jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint pending_checkouts_status check (status in ('open', 'complete', 'expired')),
  constraint pending_checkouts_seed check (jsonb_typeof(seed) = 'object')
);

comment on table public.pending_checkouts is
  'In-flight Stripe Checkout only. Not a saved project. seed may hold room names and good or better. No prices and no customer contact.';

create unique index if not exists pending_checkouts_one_open
  on public.pending_checkouts (owner, coalesce(project_id, '00000000-0000-0000-0000-000000000000'::uuid))
  where status = 'open';

alter table public.pending_checkouts enable row level security;
revoke all on public.pending_checkouts from anon, authenticated;
grant all on public.pending_checkouts to service_role;

drop policy if exists plan_pdfs_update_editable on storage.objects;
create policy plan_pdfs_update_editable
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'plan-pdfs'
    and name ~ ('^' || auth.uid()::text || '/[0-9a-f-]{36}\.pdf$')
    and exists (
      select 1 from public.projects p
      where p.owner = auth.uid()
        and p.id::text = split_part(split_part(name, '/', 2), '.', 1)
        and p.edit_until is not null
        and p.edit_until > now()
    )
  )
  with check (
    bucket_id = 'plan-pdfs'
    and name ~ ('^' || auth.uid()::text || '/[0-9a-f-]{36}\.pdf$')
    and exists (
      select 1 from public.projects p
      where p.owner = auth.uid()
        and p.id::text = split_part(split_part(name, '/', 2), '.', 1)
        and p.edit_until is not null
        and p.edit_until > now()
    )
  );
