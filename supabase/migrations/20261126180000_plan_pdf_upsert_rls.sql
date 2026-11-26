-- Re-saving a floor plan is an upsert: INSERT ... ON CONFLICT DO UPDATE.
-- Postgres then checks the UPDATE policy. The previous helper was security
-- definer, and auth.uid() is null in that context during a Storage request,
-- so the check failed with "new row violates row-level security policy"
-- while the file already stored was left in place.
--
-- This version runs as the signed-in role, where auth.uid() is set, and the
-- insert and update policies use that check directly. Apply in the SQL editor
-- after 20261126160000_plan_pdf_storage_policies.sql.

create or replace function public.plan_pdf_editable(object_name text)
returns boolean
language sql
stable
security invoker
set search_path = public, auth
as $$
  select exists (
    select 1
    from public.projects p
    where p.owner = (select auth.uid())
      and p.edit_until is not null
      and p.edit_until > now()
      and object_name = ((select auth.uid())::text || '/' || p.id::text || '.pdf')
  );
$$;

revoke all on function public.plan_pdf_editable(text) from public, anon;
grant execute on function public.plan_pdf_editable(text) to authenticated;

drop policy if exists plan_pdfs_read_own on storage.objects;
create policy plan_pdfs_read_own
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'plan-pdfs'
    and split_part(name, '/', 1) = (select auth.uid())::text
    and name ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}\.pdf$'
  );

drop policy if exists plan_pdfs_insert_editable on storage.objects;
create policy plan_pdfs_insert_editable
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'plan-pdfs'
    and public.plan_pdf_editable(name)
  );

drop policy if exists plan_pdfs_update_editable on storage.objects;
create policy plan_pdfs_update_editable
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'plan-pdfs'
    and split_part(name, '/', 1) = (select auth.uid())::text
    and public.plan_pdf_editable(name)
  )
  with check (
    bucket_id = 'plan-pdfs'
    and split_part(name, '/', 1) = (select auth.uid())::text
    and public.plan_pdf_editable(name)
  );
