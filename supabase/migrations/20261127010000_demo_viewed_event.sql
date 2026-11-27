-- Allow the Layout Tool sales demo view event.
-- Apply on project ayvfwykxpvmmmvakhlcf.

alter table public.events drop constraint if exists events_name;
alter table public.events add constraint events_name check (
  name in (
    'hero_cta_click',
    'secondary_link_click',
    'instant_quote_completed',
    'layout_checkout_started',
    'demo_viewed'
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
      'demo_viewed'
    )
    and (variant is null or variant in ('a', 'b'))
  );
