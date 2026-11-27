-- Allow the Design Helper retest button to record guide_restart.
-- Apply on project ayvfwykxpvmmmvakhlcf.

alter table public.events drop constraint if exists events_name;
alter table public.events add constraint events_name check (
  name in (
    'hero_cta_click',
    'secondary_link_click',
    'instant_quote_completed',
    'layout_checkout_started',
    'demo_viewed',
    'guide_started',
    'guide_step',
    'guide_completed',
    'guide_dismissed',
    'guide_restart'
  )
);

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
      'layout_checkout_started',
      'demo_viewed',
      'guide_started',
      'guide_step',
      'guide_completed',
      'guide_dismissed',
      'guide_restart'
    )
    and (variant is null or variant in ('a', 'b'))
  );
