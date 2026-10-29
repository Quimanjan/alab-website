-- ALAB Eco Briquettes — customer ratings & feedback
-- Run this once in Supabase → SQL Editor → New query → Run.

create extension if not exists "pgcrypto";

create table if not exists public.reviews (
  id             uuid primary key default gen_random_uuid(),
  created_at     timestamptz not null default now(),
  name           text not null default 'Anonymous' check (char_length(name) between 1 and 60),
  rating         smallint not null check (rating between 1 and 5),
  comment        text not null default '' check (char_length(comment) <= 1000),
  customer_type  text check (customer_type in ('Household', 'BBQ / ihaw-ihaw stall', 'Lechon manok', 'Restaurant / samgyupsalan', 'Sari-sari store', 'Other')),
  pack_size      text check (pack_size in ('1 kg', '3 kg', '5 kg')),
  is_visible     boolean not null default true,   -- set to false in Table Editor to hide spam
  ip_hash        text                             -- anonymised; used only for rate limiting
);

create index if not exists reviews_created_at_idx on public.reviews (created_at desc);
create index if not exists reviews_ip_hash_idx on public.reviews (ip_hash, created_at desc);

-- Lock the table down. The website never talks to Supabase directly from the browser;
-- only the Node.js API (using the service_role key) can read and write.
alter table public.reviews enable row level security;
revoke all on public.reviews from anon, authenticated;

-- ── Fun counter: coconuts visitors have thrown on the website's grill ──
create table if not exists public.site_counters (
  key   text primary key,
  value bigint not null default 0
);
insert into public.site_counters (key, value) values ('coconuts_grilled', 0) on conflict (key) do nothing;
alter table public.site_counters enable row level security;
revoke all on public.site_counters from anon, authenticated;

create or replace function public.increment_counter(counter_key text)
returns bigint
language sql
security definer
set search_path = public
as $$
  insert into public.site_counters (key, value) values (counter_key, 1)
  on conflict (key) do update set value = public.site_counters.value + 1
  returning value;
$$;
revoke all on function public.increment_counter(text) from public, anon, authenticated;
grant execute on function public.increment_counter(text) to service_role;
grant select, insert, update on public.site_counters to service_role;
