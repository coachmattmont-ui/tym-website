-- Floor plans live in the private plan-pdfs bucket at {user id}/{project id}.pdf.
-- Storage policies that read public.projects directly can fail, because the
-- storage request does not share the table role's search path. This function
-- runs as its owner and answers only "does this user still have editing open
-- on the project named by this object?" Apply in the SQL editor after
-- 20261125130000_layout_projects_function_search_path.sql.

create or replace function public.plan_pdf_editable(object_name text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.projects p
    where p.owner = auth.uid()
      and p.edit_until is not null
      and p.edit_until > pg_catalog.now()
      and object_name = (auth.uid()::text || '/' || p.id::text || '.pdf')
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
    and (storage.foldername(name))[1] = auth.uid()::text
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
    and public.plan_pdf_editable(name)
  )
  with check (
    bucket_id = 'plan-pdfs'
    and public.plan_pdf_editable(name)
  );
