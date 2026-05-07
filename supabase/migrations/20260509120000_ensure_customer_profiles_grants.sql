-- וידוא שטבלת customer_profiles קיימת + RLS + הרשאות API (מונע 404 מ־PostgREST כשהמיגרציה לא רצה)
create table if not exists public.customer_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  phone text not null,
  first_name text not null default '',
  last_name text not null default '',
  email text not null default '',
  street_name text not null default '',
  house_number text not null default '',
  apartment_number text not null default '',
  floor text not null default '',
  door_code text not null default '',
  address_notes text not null default '',
  pickup_city text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.customer_profiles add column if not exists notify_sms boolean not null default true;
alter table public.customer_profiles add column if not exists notify_email boolean not null default true;
alter table public.customer_profiles add column if not exists ui_locale text not null default 'he';

alter table public.customer_profiles enable row level security;

drop policy if exists "portal_select_own_profile" on public.customer_profiles;
create policy "portal_select_own_profile" on public.customer_profiles for select to authenticated using (user_id = auth.uid());

drop policy if exists "portal_insert_own_profile" on public.customer_profiles;
create policy "portal_insert_own_profile" on public.customer_profiles for insert to authenticated with check (user_id = auth.uid());

drop policy if exists "portal_update_own_profile" on public.customer_profiles;
create policy "portal_update_own_profile" on public.customer_profiles for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "portal_delete_own_profile" on public.customer_profiles;
create policy "portal_delete_own_profile" on public.customer_profiles for delete to authenticated using (user_id = auth.uid());

grant usage on schema public to postgres, anon, authenticated, service_role;
grant select, insert, update, delete on table public.customer_profiles to authenticated;
grant all on table public.customer_profiles to service_role;
