-- ALAB admin dashboard: visitor analytics + admin account
-- Run once in Supabase → SQL Editor (after schema.sql).

create table if not exists public.page_views (
  id          bigserial primary key,
  created_at  timestamptz not null default now(),
  path        text not null,
  visitor     text not null,       -- salted hash of IP + browser (anonymous)
  device      text,
  referrer    text
);
create index if not exists page_views_created_idx on public.page_views (created_at desc);
alter table public.page_views enable row level security;
revoke all on public.page_views from anon, authenticated;
grant select, insert on public.page_views to service_role;
grant usage, select on sequence public.page_views_id_seq to service_role;

create table if not exists public.admin_users (
  id             int primary key default 1 check (id = 1),   -- single admin account
  username       text not null,
  password_hash  text not null,                              -- scrypt, never plain text
  is_default     boolean not null default true,
  updated_at     timestamptz not null default now()
);
alter table public.admin_users enable row level security;
revoke all on public.admin_users from anon, authenticated;
grant select, insert, update on public.admin_users to service_role;

create or replace function public.admin_view_stats(range_days int default 30)
returns json
language sql
stable
security definer
set search_path = public
as $$
  with bounds as (
    select (now() at time zone 'Asia/Manila')::date as today,
           (now() at time zone 'Asia/Manila')::date - (range_days - 1) as first_day,
           (now() at time zone 'Asia/Manila')::date - (range_days * 2 - 1) as prev_first
  ),
  v as (select pv.*, (pv.created_at at time zone 'Asia/Manila')::date as d from page_views pv),
  r as (select v.* from v, bounds b where v.d >= b.first_day),
  p as (select v.* from v, bounds b where v.d >= b.prev_first and v.d < b.first_day)
  select json_build_object(
    'total_views',    (select count(*) from v),
    'total_visitors', (select count(distinct visitor) from v),
    'range_views',    (select count(*) from r),
    'range_visitors', (select count(distinct visitor) from r),
    'prev_views',     (select count(*) from p),
    'prev_visitors',  (select count(distinct visitor) from p),
    'today_views',    (select count(*) from v, bounds b where v.d = b.today),
    'today_visitors', (select count(distinct visitor) from v, bounds b where v.d = b.today),
    'daily', (
      select json_agg(json_build_object('day', to_char(g.day, 'YYYY-MM-DD'), 'views', coalesce(x.views, 0), 'visitors', coalesce(x.visitors, 0)) order by g.day)
      from bounds b cross join lateral generate_series(b.first_day, b.today, interval '1 day') as g(day)
      left join (select d, count(*) as views, count(distinct visitor) as visitors from r group by d) x on x.d = g.day::date
    ),
    'pages',     (select coalesce(json_agg(t), '[]'::json) from (select path, count(*) as views from r group by path order by views desc limit 8) t),
    'devices',   (select coalesce(json_agg(t), '[]'::json) from (select coalesce(device, 'Unknown') as device, count(*) as views from r group by 1 order by views desc limit 5) t),
    'referrers', (select coalesce(json_agg(t), '[]'::json) from (select coalesce(referrer, 'Direct') as source, count(*) as views from r group by 1 order by views desc limit 6) t)
  );
$$;
revoke all on function public.admin_view_stats(int) from public, anon, authenticated;
grant execute on function public.admin_view_stats(int) to service_role;
