-- Applied on the live yourtech project after 20261125120000_layout_projects.sql.
-- Empty search_path keeps these triggers from resolving objects through a caller-controlled path.

alter function public.protect_project_columns() set search_path = '';
alter function public.touch_project_updated_at() set search_path = '';
